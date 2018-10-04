const cards = require('./cards');
const fetch = require('./fetch');

let version = null;

// Convert "1.0.0" to 1.0.0.
const getVersionString = v => v.substring(1, v.length - 1);

const sortAllSetsArray = (setA, setB) => {
  const dateA = new Date(setA.releaseDate).valueOf();
  const dateB = new Date(setB.releaseDate).valueOf();
  if (dateA < dateB) {
    return 1;
  }
  if (dateA === dateB) {
    return 0;
  }
  return -1;
};

const checkForUpdates = () => {
  console.log('Checking for updates on ' + new Date().toUTCString());

  // Get the latest version number.
  fetch('https://mtgjson.com/json/version.json')
    .then(response => response.text())
    .then(getVersionString)
    .then(responseVersion => {
      if (version === responseVersion) {
        console.log('No update found for v' + version);
      }

      // If the latest version is not the one we have,
      else {
        console.log('Update found! v' + version + ' -> v' + responseVersion);

        // Get all cards.
        fetch('https://mtgjson.com/json/AllSetsArray.json')
          .then(response2 => response2.json())
          .then(allSetsArray => {
            console.log('Updates loaded.');
            allSetsArray.sort(sortAllSetsArray);

            // Empty the cards cache.
            cards.splice(0, cards.length);

            // For each set,
            for (const set of allSetsArray) {

              // For each card in the set,
              for (const card of set.cards) {

                // Add the needed card data to the cards map.
                cards.push(Object.assign(Object.create(null), {
                  multiverseid: card.multiverseid,
                  name: card.name,
                  set: set.code
                }));
              }
            }
            version = responseVersion;
          })
          .catch(err => {
            throw err;
          });
      }
    })
    .catch(err => {
      console.error(err);
    });
};

// Instantiate the cache at runtime.
checkForUpdates();

module.exports = checkForUpdates;
