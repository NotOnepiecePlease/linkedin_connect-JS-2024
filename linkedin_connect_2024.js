(async () => {
  // MÁXIMO DE SOLICITAÇÕES DE CONEXÃO
  const MAX_CONNECTIONS = 40;
  // TEMPO MÍNIMO EM MS DE ESPERA ANTES DE ENVIAR UMA NOVA SOLICITAÇÃO
  const WAIT_TO_CONNECT_MIN = 4000;
  // TEMPO MÁXIMO EM MS DE ESPERA ANTES DE ENVIAR UMA NOVA SOLICITAÇÃO
  const WAIT_TO_CONNECT_MAX = 6000;
  // TEMPO EM MS PARA ESPERAR O CARREGAMENTO APÓS ROLAR A PÁGINA
  const WAIT_AFTER_SCROLL = 4000;
  // PALAVRAS-CHAVE PARA FILTRAR OS CARGOS DESEJADOS
  const POSITION_KEYWORDS = [
    "Desenvolvedor",
    "Developer",
    "Backend",
    "C#",
    "Fullstack",
    "Aspnet",
    "Software Engineer",
  ];

  // ===============================================
  // !!! NÃO ALTERE AS VARIÁVEIS ABAIXO !!!
  var connections = 0;
  var stopExecution = false;
  // ===============================================

  /**
   * Encontra os elementos de botão "Conectar" na página, filtrando pelos cargos
   * que correspondem às palavras-chave.
   */
  function getButtonElements() {
    // Captura todos os botões da página
    const allButtons = [...document.querySelectorAll('button')];
    
    // Filtra apenas os botões "Conectar"
    const connectButtons = allButtons.filter((button) => {
      const buttonText = button.querySelector('.artdeco-button__text')?.innerText;
      return buttonText ? buttonText.trim() === "Connect" : false;
    });

    // Filtra os botões de acordo com o cargo da pessoa
    return connectButtons.filter((button) => {
      // O elemento 'li' representa o card completo de um resultado de pesquisa
      const cardElement = button.closest('li');
      if (cardElement) {
        // Seleciona todos os elementos de texto dentro do card para encontrar o cargo
        const textElements = cardElement.querySelectorAll('.linked-area div, .linked-area p');
        
        for (const element of textElements) {
          const positionText = element.innerText.trim();
          // Verifica se o texto do cargo contém alguma das palavras-chave
          if (POSITION_KEYWORDS.some(keyword => new RegExp(keyword, "i").test(positionText))) {
            return true; // Encontrou um cargo correspondente, mantém o botão na lista
          }
        }
      }
      return false; // Não encontrou cargo correspondente, descarta o botão
    });
  }
  
  /**
   * Gera um tempo de espera aleatório para simular comportamento humano.
   */
  function getRandomWaitTime(min, max) {
    let randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log(`⏳ Esperando por ${randomValue / 1000} segundos...`);
    return randomValue;
  }

  /**
   * Verifica se os modais de limite de convites do LinkedIn apareceram.
   */
  async function checkForLimitModal() {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Verifica o modal de limite semanal atingido
        const limitModal = document.querySelector('div.ip-fuse-limit-alert');
        if (limitModal) {
          const gotItButton = document.querySelector('button[aria-label="Got it"]');
          if (gotItButton) {
            gotItButton.click();
            connections--;
            console.log("⚠️ Limite semanal de convites atingido. O script será interrompido.");
            stopExecution = true;
          }
        }

        // Verifica o modal de aviso de "próximo do limite"
        const closeLimitModal = document.querySelector('h2.ip-fuse-limit-alert__header');
        if (closeLimitModal && closeLimitModal.innerText.includes("You're close to the weekly invitation limit")) {
          const gotItButton = document.querySelector('button[aria-label="Got it"]');
          if (gotItButton) {
            gotItButton.click();
            console.log("⚠️ Próximo do limite semanal de convites. Fechando aviso.");
          }
        }
        resolve();
      }, 1000); // Espera 1 segundo para o modal aparecer
    });
  }

  /**
   * Clica no botão "Conectar" e envia o convite sem nota.
   */
  async function connect(button) {
    return new Promise((resolve) => {
      setTimeout(async () => {
        // Encontra o card (li) pai do botão
        const cardElement = button.closest('li');
        if (cardElement) {
          // Captura o nome da pessoa de forma mais robusta
          const nameElement = cardElement.querySelector('span[aria-hidden="true"]');
          const name = nameElement ? nameElement.innerText.trim() : "Pessoa Desconhecida";

          button.click(); // Clica no botão "Conectar"
          console.log(`🤝 Clicado em 'Conectar' para: ${name}`);

          // Espera um momento para o modal de envio aparecer
          await new Promise((res) => setTimeout(res, 1000));

          // Verifica se o modal de limite apareceu antes de enviar
          await checkForLimitModal();
          if (stopExecution) {
            resolve();
            return;
          }

          // Procura o botão "Enviar sem nota" (aria-label pode variar com o idioma)
          const sendNowButton = document.querySelector('button[aria-label="Send without a note"]') || document.querySelector('button[aria-label="Enviar sem nota"]');

          if (sendNowButton) {
            sendNowButton.click();
            connections++;
            console.log(`📩 Convite enviado para ${name} | Total: ${connections}`);
          } else {
            console.log("❌ Não foi possível encontrar o botão 'Enviar sem nota'. Tentando fechar o modal.");
            const closeModalButton = document.querySelector('button[aria-label="Dismiss"]');
            if(closeModalButton) closeModalButton.click();
          }
        } else {
          console.log("❌ Não foi possível encontrar o card do perfil.");
        }

        resolve();
      }, getRandomWaitTime(WAIT_TO_CONNECT_MIN, WAIT_TO_CONNECT_MAX));
    });
  }

  /**
   * Rola a página para carregar mais resultados.
   */
  async function loadMoreButtons() {
    console.log("⏬ Rolando para carregar mais resultados...");
    window.scrollTo(0, document.body.scrollHeight);
    return new Promise((resolve) => setTimeout(resolve, WAIT_AFTER_SCROLL));
  }
  
  /**
   * Clica no botão para ir para a próxima página de resultados.
   */
  async function goToNextPage() {
    // O seletor [aria-label="Next"] está correto conforme o HTML enviado
    const nextPageButton = document.querySelector('button[aria-label="Next"]');
    if (nextPageButton && !nextPageButton.disabled) {
      nextPageButton.click();
      console.log("➡️ Movendo para a próxima página...");
      // Espera um tempo para a nova página carregar
      await new Promise((resolve) => setTimeout(resolve, 5000)); 
      return true;
    } else {
      console.log("❌ Não há mais páginas ou o botão 'Next' não foi encontrado/está desabilitado.");
      return false;
    }
  }

  /**
   * Função principal que orquestra todo o processo.
   */
  async function connectAll() {
    let hasMorePages = true;

    while (connections < MAX_CONNECTIONS && hasMorePages && !stopExecution) {
      let buttons = getButtonElements();
      console.log(`🔎 Encontrados ${buttons.length} perfis correspondentes nesta página.`);

      if (buttons.length === 0) {
        console.log("⚠️ Nenhum perfil compatível encontrado. Tentando carregar mais...");
        await loadMoreButtons(); // Rola a página para ver se aparecem mais resultados
        buttons = getButtonElements(); // Tenta encontrar botões novamente
        
        // Se ainda não houver botões, tenta ir para a próxima página
        if(buttons.length === 0) {
            hasMorePages = await goToNextPage();
            continue; // Pula para a próxima iteração do loop
        }
      }

      for (let button of buttons) {
        if (connections >= MAX_CONNECTIONS || stopExecution) break;
        await connect(button);
      }
      
      // Se a execução não parou, vai para a próxima página
      if (!stopExecution && connections < MAX_CONNECTIONS) {
          hasMorePages = await goToNextPage();
      }
    }

    console.log(`✅ Processo finalizado! ${connections} convites foram enviados.`);
  }

  console.log("🚀 Iniciando automação de conexões...");
  try {
    await connectAll();
  } catch (error) {
    console.log(`⛔ Ops, algo deu errado: ${error.message}.`);
  }
})();
