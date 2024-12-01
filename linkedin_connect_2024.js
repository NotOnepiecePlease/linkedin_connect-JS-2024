(async () => {
  // maximum amount of connection requests
  const MAX_CONNECTIONS = 40;
  // minimum time in ms to wait before requesting to connect
  const WAIT_TO_CONNECT_MIN = 4000;
  // maximum time in ms to wait before requesting to connect
  const WAIT_TO_CONNECT_MAX = 6000;
  // time in ms to wait before new employees load after scroll
  const WAIT_AFTER_SCROLL = 4000;
  // keywords to filter employees in specific positions
  const POSITION_KEYWORDS = [
    "Desenvolvedor",
    "Developer",
    "Backend",
    "C#",
    "Fullstack",
    "Aspnet",
  ];

  //DO NOT CHANGE THIS!!!
  var connections = 0;
  var stopExecution = false; // Flag to stop execution if the limit modal appears
  //=======================

  function getButtonElements() {
    return [
      ...document.querySelectorAll(
        'button.artdeco-button.artdeco-button--2.artdeco-button--secondary[aria-label^="Invite"]'
      ),
    ].filter((button) => {
      const cardElement = button.closest('.reusable-search__result-container, [class*="RyTuXtNbNfnQgGCGCPmxRKHgCkIkcqpgU"]');
      if (cardElement) {
        const positionElement = cardElement.querySelector(
          '.entity-result__primary-subtitle, .RDflFehliBNpfjVinjDVWgVmjjjHiY'
        );
        if (positionElement) {
          const position = positionElement.innerText.trim();
          return POSITION_KEYWORDS.some((p) =>
            position.match(new RegExp(p, "gi"))
          );
        }
      }
      return false;
    });
  }

  function getRandomWaitTime(min, max) {
    let randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log(`Waiting for: ${randomValue}`);
    return randomValue;
  }

  async function checkForLimitModal() {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Check for the modal indicating the weekly invitation limit
        const limitModal = document.querySelector('div.ip-fuse-limit-alert');
        if (limitModal) {
          const gotItButton = document.querySelector('button[aria-label="Got it"]');
          if (gotItButton) {
            gotItButton.click();
            connections--;
            console.log("⚠️ You've reached the weekly invitation limit. Stopping script.");
            stopExecution = true; // Set flag to true to stop further connections
          }
        }

        // Check for the modal that says you're "close" to the limit
        const closeLimitModal = document.querySelector('h2.ip-fuse-limit-alert__header');
        if (closeLimitModal && closeLimitModal.innerText.includes("You're close to the weekly invitation limit")) {
          const gotItButton = document.querySelector('button[aria-label="Got it"]');
          if (gotItButton) {
            gotItButton.click();
            console.log("⚠️ You're close to the weekly invitation limit. Clicked 'Got it'.");
          }
        }
        resolve();
      }, 1000); // Check every 1 second
    });
  }

  async function connect(button) {
    return new Promise((resolve) => {
      setTimeout(async () => {
        // Extract the person's name
        const cardElement = button.closest('.reusable-search__result-container, [class*="RyTuXtNbNfnQgGCGCPmxRKHgCkIkcqpgU"]');
        const nameElement = cardElement.querySelector('.tfgLtQIzxzhxhkrxmKfLqVUiHNfBgctlDOJghg .jfxEvfUAOpHIZRGhMxPXhWgZwHrDuAQ a span[aria-hidden="true"]');
        const name = nameElement ? nameElement.innerText.trim() : "Unknown Person";

        button.click();
        console.log(`🤝 Requested connection to ${name}`);
        // Wait for the connection modal
        await new Promise((res) => setTimeout(res, 1000));

        // Check if the weekly limit modal appeared before attempting to send the connection
        await checkForLimitModal();
        if (stopExecution) {
          resolve();
          return;
        }

        const sendNowButton = document.querySelector('button[aria-label="Send without a note"]');
        if (sendNowButton) {
          sendNowButton.click(); // Click the "Send without note" button
          connections++; // Increment the number of connections
          console.log(`📩 Sent connection without note to ${name}, number: ${connections}`);
        } else {
          console.log("❌ Could not find 'Send without a note' button.");
        }

        resolve();
      }, getRandomWaitTime(WAIT_TO_CONNECT_MIN, WAIT_TO_CONNECT_MAX)); // Wait for a random time between min and max
    });
  }

  async function* getConnectButtons() {
    let buttons = getButtonElements();
    while (buttons.length === 0) {
      await loadMoreButtons();
      buttons = getButtonElements();
    }
    yield* buttons;
  }

  async function loadMoreButtons() {
    console.log("⏬ Scrolling to load more results...");
    window.scrollTo(0, document.body.scrollHeight);
    return new Promise((resolve) => setTimeout(resolve, WAIT_AFTER_SCROLL));
  }

  // Function to move to the next page
  async function goToNextPage() {
    const nextPageButton = document.querySelector('button[aria-label="Next"]');
    if (nextPageButton) {
      nextPageButton.click();
      console.log("➡️ Moving to next page");
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for the next page to load
    } else {
      console.log("❌ No more pages or 'Next' button not found");
      return false; // Return false if there are no more pages
    }
    return true; // Return true if there are more pages
  }

  // Main connection function
  async function connectAll() {
    let hasMorePages = true;

    while (connections < MAX_CONNECTIONS && hasMorePages && !stopExecution) {
      let buttons = getButtonElements();

      // If no "Connect" buttons are found on the page, move to the next page
      if (buttons.length === 0) {
        console.log("⚠️ No 'Connect' buttons found on this page, moving to next page...");
        hasMorePages = await goToNextPage(); // Try to move to the next page
        continue; // Restart the loop
      }

      // Connect to each button found
      for (let button of buttons) {
        if (connections >= MAX_CONNECTIONS || stopExecution) break; // Stop if the maximum connections have been reached
        await connect(button); // Execute the connection process
      }

      // Try to move to the next page if there are more pages and the limit hasn't been reached
      if (connections < MAX_CONNECTIONS && !stopExecution) {
        hasMorePages = await goToNextPage(); // Try to move to the next page
      }
    }

    console.log(`✅ Done! Successfully requested connection to ${connections} people.`);
  }

  console.log("⏳ Started connecting, please wait.");
  try {
    await connectAll(); // Start the connection process
  } catch (error) {
    console.log(`⛔ Whoops, something went wrong: ${error.message}.`);
  }
})();