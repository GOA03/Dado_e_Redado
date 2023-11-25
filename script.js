// Quando o usuário ajusta o controle deslizante de tamanho da fonte, essa função é acionada para redefinir o tamanho da fonte de vários elementos
document.getElementById('fontSizeSlider').addEventListener('input', function() {
    // Obtendo o tamanho selecionado do controle deslizante e convertendo para número decimal
    const selectedSize = parseFloat(this.value);
    const rootElement = document.documentElement;

    // Ajustando o tamanho da fonte para o elemento root baseado no tamanho selecionado
    rootElement.style.fontSize = 16 * selectedSize + 'px';

    // Definindo a escala da imagem para o tamanho selecionado
    const imageScale = selectedSize;
    document.querySelectorAll('#contenedor-dados img').forEach(img => {
        img.style.transform = `scale(${imageScale})`;
        img.style.margin = `${20 * selectedSize}px`;
    });

    // Ajustando o tamanho da fonte de vários outros elementos de acordo com o tamanho selecionado
    document.getElementById('pergunta').style.fontSize = 20 * selectedSize + 'px';
    document.getElementById('displayPontos').style.fontSize = 24 * selectedSize + 'px';
    document.getElementById('vidas').style.fontSize = 32 * selectedSize + 'px';
    document.querySelectorAll('#opcoes button').forEach(btn => {
        btn.style.fontSize = 18 * selectedSize + 'px';
    });

    // Ajustando a altura do container de progresso baseado no tamanho selecionado
    document.getElementById('progressoContainer').style.height = 20 * selectedSize + 'px';
    
    // Mostrando o tamanho atual no elemento 'currentSize'
    document.getElementById('currentSize').innerText = (selectedSize * 100).toFixed(0) + '%';

    // Ajustando o tamanho e o padding do botão de áudio
    const audioButton = document.getElementById('toggleSound');
    audioButton.style.fontSize = 16 * selectedSize + 'px';
    audioButton.style.padding = (10 * selectedSize) + 'px ' + (20 * selectedSize) + 'px';
});

let isUppercase = false;

document.querySelector('.font-icon').addEventListener('click', function() {
    // Seleciona todos os elementos de texto na página e verifica o estado da flag
    document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, span, a, button').forEach(element => {
        if (!isUppercase) {
            element.textContent = element.textContent.toUpperCase();
        } else {
            element.textContent = capitalizeFirstLetter(element.textContent);
        }
    });

    // Atualiza o estado da flag
    isUppercase = !isUppercase;
});

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

// Quando o conteúdo do documento estiver totalmente carregado, essa função será acionada para iniciar a lógica do jogo
document.addEventListener('DOMContentLoaded', function() {
    // Referências para os principais elementos do DOM utilizados no jogo
    const contenedorJogo = document.getElementById('contenedor-jogo');
    const vidasElement = document.getElementById('vidas');
    const displayPontos = document.getElementById('displayPontos');
    const feedback = document.getElementById('feedback');
    const barraProgresso = document.getElementById('barraProgresso');
    const contenedorDados = document.getElementById('contenedor-dados');
    const divOpcoes = document.getElementById('opcoes');
    const perguntaElement = document.getElementById('pergunta');
    const mensagemGameOver = document.getElementById('mensagemGameOver');
    const jogoMemoria = document.getElementById('jogoMemoria');
    const memoriaGrid = document.getElementById('memoriaGrid');
    const barraProgressoMemoria = document.getElementById('barraProgressoMemoria');
    const cards = ['A', 'A', 'B', 'B', 'C', 'C']; // Um conjunto simples de cartas para o jogo da memória


    // Variáveis de estado inicial do jogo
    let jogadas = 0;
    let vidas = 3;
    let pontos = 0;
    let resultadosAnteriores = [];
    let dificuldadeSelecionada = 'dificil';
    let etapasConcluidas = 0;

    // Configuração dos sons do jogo
    const sounds = {
        gameOver: new Audio('sounds/gameover.mp3'),
        correct: new Audio('sounds/correct.mp3'),
        backgroundMusic: new Audio('backgroundMusic.mp3'),
        wrong: new Audio('sounds/wrong.mp3')
    };

    let isSoundOn = true;
    sounds.backgroundMusic.loop = true;
    sounds.backgroundMusic.volume = 0.5;
    if (isSoundOn) sounds.backgroundMusic.play();

    // Função para tocar um som específico
    function playSound(sound) {
        if (isSoundOn) {
            sound.currentTime = 0;
            sound.play();
        }
    }

    // Função para obter um número inteiro aleatório entre min e max
    function getIntAleatorio(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Função para mostrar a mensagem de fim de jogo
    function mostrarEndgame() {
        document.getElementById('jogoMemoria').style.display = 'none';  // Escondendo o jogo da memória ao terminá-lo
        mensagemGameOver.innerHTML = '<h1>Parabéns!</h1><p>Você terminou o jogo!</p><p>Clique para jogar novamente.</p>';
        
        // Alterando o estilo da mensagem para verde claro
        mensagemGameOver.style.backgroundColor = 'lightgreen';
        mensagemGameOver.style.color = 'white';
        mensagemGameOver.style.display = 'block';
        
        // Função que manipula o clique na mensagem de fim de jogo
        const reiniciarHandler = function() {
            mensagemGameOver.style.display = 'none';
            
            // Exibir o menu de dificuldade em vez de reiniciar imediatamente o jogo
            const menuDificuldade = document.getElementById('menuDificuldade');
            menuDificuldade.style.display = 'block';
            contenedorJogo.style.display = 'none';  // Esconde o contêiner do jogo
        };
        
        mensagemGameOver.removeEventListener('click', reiniciarHandler);
        mensagemGameOver.addEventListener('click', reiniciarHandler);
    }

    // Função para reiniciar o jogo para seu estado inicial
    function reiniciarJogo() {
        nivelAtual = 1;
        jogadas = 0;
        vidas = 3;
        pontos = 0;
        jogosConcluidos = 0;  // Adicionada a reinicialização
        atualizarDisplayVidas();
        atualizarBarraProgresso();
        atualizarDisplayPontos();
        proximoNivel();
        
        // Reativar os botões quando o jogo for reiniciado
        divOpcoes.querySelectorAll('button').forEach(btn => {
            btn.disabled = false;
        });
    }

    // Função para atualizar o display de vidas restantes
    function atualizarDisplayVidas() {
        let conteudoVidas = '';
        for (let i = 0; i < vidas; i++) {
            conteudoVidas += '❤️ ';
        }
        vidasElement.innerHTML = conteudoVidas.trim();
    }

    // Função para gerar e exibir opções de respostas para o jogador
    function mostrarOpcoes(valorCorreto, dificuldade) {
        divOpcoes.innerHTML = '';
        const opcoes = gerarOpcoesUnicas(valorCorreto);
    
        if (dificuldade !== "dificil") {  // Sorting for both "facil" and "normal"
            opcoes.sort((a, b) => a - b);
        }
    
        opcoes.forEach(opt => {
            const btn = document.createElement('button');
            btn.innerText = opt;
    
            btn.onclick = function() {
                divOpcoes.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                verificarResposta(opt, valorCorreto);
            };
    
            divOpcoes.appendChild(btn);
        });
    }

    // Função para exibir imagens de dados com base nos valores fornecidos
    function mostrarImagensDados(valoresDados) {
        contenedorDados.innerHTML = '';
        valoresDados.forEach(valor => {
            const img = document.createElement('img');
            img.src = `dado${valor}.png`;
    
            // Adicionando os eventos de mouseover e mouseout apenas no modo fácil
            if (dificuldadeSelecionada === 'facil') {
                img.addEventListener('mouseover', function() {
                    img.alt = valor;
                    img.title = valor; // tooltip padrão do navegador exibirá este valor
                });
                img.addEventListener('mouseout', function() {
                    img.alt = '';
                    img.title = ''; // removendo o tooltip
                });
            }
    
            contenedorDados.appendChild(img);
        });
    }

    // Função para embaralhar elementos de um array
    function embaralharArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    // Função para gerar um conjunto de opções únicas, incluindo a resposta correta
    function gerarOpcoesUnicas(valorCorreto) {
        const opcoes = [valorCorreto];
        while (opcoes.length < 3) {
            const opcao = getIntAleatorio(1, (nivelAtual === 1) ? 6 : 12);
            if (!opcoes.includes(opcao)) {
                opcoes.push(opcao);
            }
        }
        embaralharArray(opcoes);
        return opcoes;
    }
    

    // Função para verificar se a resposta fornecida pelo jogador está correta
    function verificarResposta(resposta, valorCorreto) {
        if (resposta === valorCorreto) {
            playSound(sounds.correct);
            mostrarFeedback(true);
            pontos += 10;
            atualizarDisplayPontos();
            jogadas++;
    
            atualizarBarraProgresso();
    
            if (jogadas >= 5) {
                // Após terminar as 5 questões, inicie o jogo da memória
                document.getElementById('contenedor-jogo').style.display = 'none'; // Esconde o contêiner da fase 1
                iniciarJogoMemoria(); // Função para iniciar o jogo da memória
                return;
            }
            proximoNivel();
        } else {
            playSound(sounds.wrong);
            mostrarFeedback(false);
            const botoes = divOpcoes.getElementsByTagName('button');
            for (let btn of botoes) {
                if (btn.innerText == resposta) {
                    btn.disabled = true;
                    btn.style.opacity = 0.5;
                }
            }
            vidas--;
            atualizarDisplayVidas();
            if (vidas <= 0) {
                mostrarGameOver();
                return;
            }
        }
    }

    // Função para exibir uma mensagem de Game Over ao jogador
    function mostrarGameOver() {
        playSound(sounds.gameOver);
        mensagemGameOver.style.display = 'block';
        
        // Desativar todos os botões de opção ao mostrar Game Over
        divOpcoes.querySelectorAll('button').forEach(btn => {
            btn.disabled = true;
        });
    
        mensagemGameOver.onclick = function() {
            mensagemGameOver.style.display = 'none';
            
            // Exibir a tela de seleção de dificuldade em vez de reiniciar imediatamente o jogo
            const menuDificuldade = document.getElementById('menuDificuldade');
            menuDificuldade.style.display = 'block';
            contenedorJogo.style.display = 'none';  // Esconde o contêiner do jogo
        };
    }

    // Função para atualizar o display dos pontos do jogador
    function atualizarDisplayPontos() {
        displayPontos.innerText = `Pontos: ${pontos}`;
        if (pontos !== 0 && pontos % 10 === 0) {
            displayPontos.classList.add('pontuacaoGanha');
            setTimeout(() => {
                displayPontos.classList.remove('pontuacaoGanha');
            }, 200);
        }
    }

    const resultadosAnterioresSet = new Set();

    // Função para avançar o jogo para o próximo nível
    function proximoNivel() {
        let valorDado1, valorDado2, resultado, operacao;

        // Se estiver nas duas primeiras jogadas (correspondente ao nível 1)
        if (jogadas < 2) {
            do {
                valorDado1 = getIntAleatorio(1, 6);
                resultado = valorDado1;
            } while (resultadosAnterioresSet.has(resultado));
    
            perguntaElement.innerText = `QUAL É O VALOR DO DADO?`;
            mostrarImagensDados([valorDado1]);
            mostrarOpcoes(resultado, dificuldadeSelecionada);
    
        } else if (jogadas >= 2 && jogadas < 5) {  // Para as três próximas jogadas (correspondente ao nível 2)
            
            if (jogadas == 2) {
                vidas = 3; // Reinicializa as vidas
                atualizarDisplayVidas(); // Atualiza o display de vidas
            }

            do {
                valorDado1 = getIntAleatorio(1, 6);
                valorDado2 = getIntAleatorio(1, 6);
    
                if (dificuldadeSelecionada === "facil") {
                    operacao = 'soma';
                    resultado = valorDado1 + valorDado2;
                } else if (dificuldadeSelecionada === "normal") {
                    operacao = Math.random() > 0.5 ? 'soma' : 'subtracao';
                    if (operacao === 'subtracao' && valorDado2 > valorDado1) {
                        [valorDado1, valorDado2] = [valorDado2, valorDado1];
                    }
                    resultado = (operacao === 'soma') ? valorDado1 + valorDado2 : valorDado1 - valorDado2;
                } else { // modo difícil
                    operacao = Math.random() > 0.5 ? 'soma' : 'subtracao';
                    resultado = (operacao === 'soma') ? valorDado1 + valorDado2 : valorDado1 - valorDado2;
                }
    
            } while (resultadosAnterioresSet.has(resultado));
    
            if (operacao === 'soma') {
                perguntaElement.innerText = `Qual é a soma dos dados?`;
                if (dificuldadeSelecionada === "normal") {
                    perguntaElement.style.color = 'blue';
                } else { // "facil" ou "dificil"
                    perguntaElement.style.color = 'black';
                }
            } else {  // subtração
                perguntaElement.innerText = `Qual é a subtração dos dados?`;
                if (dificuldadeSelecionada === "normal") {
                    perguntaElement.style.color = 'red';
                } else { // "facil" ou "dificil"
                    perguntaElement.style.color = 'black';
                }
            }
    
            mostrarImagensDados([valorDado1, valorDado2]);
            mostrarOpcoes(resultado, dificuldadeSelecionada);
        } else if (jogadas === 5) {
            return;
        }
    
        resultadosAnterioresSet.add(resultado);
    }
      
    // Função para mostrar feedback ao jogador sobre se ele acertou ou errou a resposta
    function mostrarFeedback(acerto) {
        feedback.style.display = 'block';
        if (acerto) {
            feedback.classList.add('acerto');
            feedback.classList.remove('erro');
            feedback.innerText = '🎉 Acertou! 🎉';
        } else {
            feedback.classList.add('erro');
            feedback.classList.remove('acerto');
            feedback.innerText = 'Errou!';
        }
        setTimeout(() => {
            feedback.style.display = 'none';
        }, 1000);
    }

    // Função para atualizar a barra de progresso do jogador
    function atualizarBarraProgresso() {
        let progressoTotal;
        if (nivelAtual === 1) {
            progressoTotal = (jogadas / 5) * 100;
        } else {
            progressoTotal = 40 + (jogadas / 5) * 100;
        }
        barraProgresso.style.width = `${progressoTotal}%`;
    
        // Atualize o texto de progresso
        const progressoTexto = document.getElementById('progressoTexto');
        progressoTexto.innerText = `${jogadas}/5`;
    }

    // Função para alternar o som do jogo
    document.getElementById('toggleSound').addEventListener('click', function() {
        if (isSoundOn) {
            this.textContent = '🔇';
            isSoundOn = false;
            sounds.backgroundMusic.pause();
        } else {
            this.textContent = '🔊';
            isSoundOn = true;
            sounds.backgroundMusic.play();
        }
    });

    // Configurações iniciais para o estado inicial do jogo
    contenedorJogo.style.display = 'none';
    const menuDificuldade = document.getElementById('menuDificuldade');
    menuDificuldade.style.display = 'block';

    // Adicionando ouvintes de evento aos botões no menu de seleção de dificuldade
    document.querySelectorAll('#menuDificuldade button').forEach(button => {
        button.addEventListener('click', function() {
            dificuldadeSelecionada = this.getAttribute('data-dificuldade');
            contenedorJogo.style.display = 'block';
            menuDificuldade.style.display = 'none';
            reiniciarJogo();
        });
    });
});

// JOGO DA MEMÓRIA ---------------------------------------------------------------------------------------------------------------------------

let cartasMemoria = [];
let cartasViradas = [];
let jogosConcluidos = 0;

function iniciarJogoMemoria() {
    document.getElementById('contenedor-jogo').style.display = 'none';
    const jogoMemoria = document.getElementById('jogoMemoria');
    jogoMemoria.style.display = 'block';
    const memoriaCartas = document.getElementById('memoriaCartas');
    memoriaCartas.innerHTML = '';

    const valores = ['1', '2', '3', '1', '2', '3'];
    embaralharArray(valores); 

    valores.forEach(valor => {
        const carta = document.createElement('div');
        carta.className = 'memoriaCarta';
        carta.dataset.valor = valor;
        if (parseInt(valor) > 0) {
            const img = document.createElement('img');
            img.src = `dado${valor}.png`;
            carta.appendChild(img);
        } else {
            carta.innerText = valor;
        }
        carta.addEventListener('click', virarCarta);
        memoriaCartas.appendChild(carta);
    });

    // Inicializar a barra de progresso e o texto de progresso para o jogo da memória
    const barraProgressoMemoria = document.getElementById('barraProgressoMemoria');
    barraProgressoMemoria.style.width = '0%'; 
    const progressoTextoMemoria = document.getElementById('progressoTextoMemoria');
    progressoTextoMemoria.innerText = "0/3";
}


function virarCarta() {
    if (cartasViradas.length < 2 && !this.classList.contains('virada')) {
        cartasViradas.push(this);
        if (parseInt(this.dataset.valor) > 0) {
            this.querySelector('img').style.display = 'block';
        } else {
            this.style.backgroundColor = '#fff';
            this.style.color = '#444';
        }
        this.classList.add('virada');

        if (cartasViradas.length === 2) {
            setTimeout(verificarCartas, 1000);
        }
    }
}

function mostrarFimJogoMemoria() {
    document.getElementById('jogoMemoria').style.display = 'none';
    const mensagemGameOver = document.getElementById('mensagemGameOver');
    mensagemGameOver.innerHTML = '<h1>Parabéns!</h1><p>Você terminou o jogo da memória!</p><p>Clique para jogar novamente.</p>';
    
    mensagemGameOver.style.backgroundColor = 'lightgreen';
    mensagemGameOver.style.color = 'white';
    mensagemGameOver.style.display = 'block';
    
    const reiniciarHandler = function() {
        mensagemGameOver.style.display = 'none';
        
        // Exibir o menu de dificuldade em vez de reiniciar imediatamente o jogo
        const menuDificuldade = document.getElementById('menuDificuldade');
        menuDificuldade.style.display = 'block';
        contenedorJogo.style.display = 'none';  // Esconde o contêiner do jogo
    };
    
    mensagemGameOver.removeEventListener('click', reiniciarHandler);
    mensagemGameOver.addEventListener('click', reiniciarHandler);
}

function verificarCartas() {
    if (cartasViradas[0].dataset.valor === cartasViradas[1].dataset.valor) {
        cartasViradas[0].removeEventListener('click', virarCarta);
        cartasViradas[1].removeEventListener('click', virarCarta);
        jogosConcluidos++;

        // Atualização da barra de progresso e do texto de progresso para o jogo da memória
        const barraProgressoMemoria = document.getElementById('barraProgressoMemoria');
        barraProgressoMemoria.style.width = `${(jogosConcluidos / 3) * 100}%`; 
        const progressoTextoMemoria = document.getElementById('progressoTextoMemoria');
        progressoTextoMemoria.innerText = `${jogosConcluidos}/3`;
    } else {
        cartasViradas[0].classList.remove('virada');
        cartasViradas[1].classList.remove('virada');

        if (parseInt(cartasViradas[0].dataset.valor) > 0) {
            cartasViradas[0].querySelector('img').style.display = 'none';
        } else {
            cartasViradas[0].style.backgroundColor = '#444';
            cartasViradas[0].style.color = '#fff';
        }

        if (parseInt(cartasViradas[1].dataset.valor) > 0) {
            cartasViradas[1].querySelector('img').style.display = 'none';
        } else {
            cartasViradas[1].style.backgroundColor = '#444';
            cartasViradas[1].style.color = '#fff';
        }
    }
    cartasViradas = [];

    // Atualizar a barra de progresso e o texto de progresso para o jogo da memória
    const progressoTextoMemoria = document.getElementById('progressoTextoMemoria');
    progressoTextoMemoria.innerText = `${jogosConcluidos}/3`;

    if (jogosConcluidos === 3) {
        mostrarFimJogoMemoria();
    }
}


function embaralharArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


function atualizarBarraProgressoMemoria() {
    let progressoTotal = (jogosConcluidos / 3) * 100; // Existem 3 pares no jogo da memória, então usamos 3 como divisor
    barraProgressoMemoria.style.width = `${progressoTotal}%`;
}
