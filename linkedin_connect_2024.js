(async () => {

  // maximum amount of connection requests
  const MAX_CONNECTIONS = 3;
  // time in ms to wait before requesting to connect
  const WAIT_TO_CONNECT = 4000;
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
  //=======================
  
  function getButtonElements() {
    return [
      ...document.querySelectorAll(
        'button[aria-label^="Invite"]' // Busca por botões "Invite [nome] to connect"
      ),
    ].filter((button) => {
      const cardElement = button.closest('.reusable-search__result-container');
      if (cardElement) {
        const positionElement = cardElement.querySelector(
          '.entity-result__primary-subtitle'
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

  async function connect(button) {
    return new Promise((resolve) => {
      setTimeout(async () => {
        // Extrair o nome da pessoa
        const cardElement = button.closest('.reusable-search__result-container');
        const nameElement = cardElement.querySelector('.entity-result__title-text span[aria-hidden="true"]');
        const name = nameElement ? nameElement.innerText.trim() : "Unknown Person";

        button.click();
        console.log(`🤝 Requested connection to ${name}`);
        // Espera pelo modal de conexão
        await new Promise((res) => setTimeout(res, 1000));
        const sendNowButton = document.querySelector('button[aria-label="Send without a note"]');
        if (sendNowButton) {
          sendNowButton.click(); // Clica no botão "Send without note"
          console.log(`📩 Sent connection without note to ${name}, number: ${connections + 1}`);
        } else {
          console.log("❌ Could not find 'Send without a note' button.");
        }

        // Verifica se o modal de aviso do LinkedIn aparece e clica no botão "Got it"
        const gotItButton = document.querySelector('button[aria-label="Got it"]');
        if (gotItButton) {
          gotItButton.click();
          console.log("✅ Clicked 'Got it' on LinkedIn warning.");
        }

        resolve();
      }, WAIT_TO_CONNECT);
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

  // Função para passar para a próxima página
  async function goToNextPage() {
    const nextPageButton = document.querySelector('button[aria-label="Next"]');
    if (nextPageButton) {
      nextPageButton.click();
      console.log("➡️ Moving to next page");
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Espera carregar a próxima página
    } else {
      console.log("❌ No more pages or 'Next' button not found");
      return false; // Retorna falso se não houver mais páginas
    }
    return true; // Retorna true se houver mais páginas
  }

  // Função principal de conexão
  async function connectAll() {
   
    let hasMorePages = true;

    while (connections < MAX_CONNECTIONS && hasMorePages) {
      let buttons = getButtonElements();

      // Se não houver mais botões "Connect" na página, ir para a próxima página
      if (buttons.length === 0) {
        console.log("⚠️ No 'Connect' buttons found on this page, moving to next page...");
        hasMorePages = await goToNextPage(); // Tenta ir para a próxima página
        continue; // Recomeça o loop
      }

      // Conectar com cada botão encontrado
      for (let button of buttons) {
        if (connections >= MAX_CONNECTIONS) break; // Se já atingiu o máximo de conexões, interrompe
        await connect(button); // Executa o processo de conexão
        connections++; // Incrementa o número de conexões
      }

      // Tenta ir para a próxima página caso tenha mais páginas e não tenha atingido o limite
      if (connections < MAX_CONNECTIONS) {
        hasMorePages = await goToNextPage(); // Tenta ir para a próxima página
      }
    }

    console.log(`✅ Done! Successfully requested connection to ${connections} people.`);
  }

  console.log("⏳ Started connecting, please wait.");
  try {
    await connectAll(); // Inicia o processo de conexão
  } catch (error) {
    console.log(`⛔ Whoops, something went wrong: ${error.message}.`);
  }
})();
