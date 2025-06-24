document.addEventListener('DOMContentLoaded', function() {
    // --- CÓDIGO DO CARROSSEL DE IMAGENS ---
    const slidesWrapper = document.querySelector('.slides-wrapper');
    const slides = document.querySelectorAll('.slide');
    const dotsContainer = document.querySelector('.slider-dots');
    const prevButton = document.querySelector('.slide-button.prev');
    const nextButton = document.querySelector('.slide-button.next');
    const sliderContainer = document.querySelector('.slider-container');
    let currentSlide = 0;
    let slideInterval;

    if (slides.length === 0) {
        console.warn('Nenhum slide encontrado para o carrossel. O carrossel não será inicializado.');
        if (sliderContainer) {
            sliderContainer.style.display = 'none';
        }
    } else {
        slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('dot');
            if (index === 0) {
                dot.classList.add('active');
            }
            dot.setAttribute('aria-label', `Ir para o slide ${index + 1}`);
            dot.addEventListener('click', () => {
                goToSlide(index);
                resetInterval();
            });
            dotsContainer.appendChild(dot);
        });

        const dots = document.querySelectorAll('.dot');

        function showSlide(index) {
            slidesWrapper.style.transform = `translateX(-${index * 100}%)`;
            dots.forEach(dot => dot.classList.remove('active'));
            if (dots[index]) {
                dots[index].classList.add('active');
            }
            currentSlide = index;
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        }

        function goToSlide(index) {
            showSlide(index);
        }

        function startInterval() {
            slideInterval = setInterval(nextSlide, 5000);
        }

        function resetInterval() {
            clearInterval(slideInterval);
            startInterval();
        }

        showSlide(currentSlide);
        startInterval();

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                prevSlide();
                resetInterval();
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                nextSlide();
                resetInterval();
            });
        }

        if (sliderContainer) {
            sliderContainer.addEventListener('mouseenter', () => {
                clearInterval(slideInterval);
            });

            sliderContainer.addEventListener('mouseleave', () => {
                startInterval();
            });
        }
    }


    // --- CÓDIGO DO DROPDOWN DE BATERIAS (Moura/Heliar) NO HEADER ---
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('mouseenter', () => {
            dropdown.querySelector('.dropdown-content').style.display = 'block';
        });
        dropdown.addEventListener('mouseleave', () => {
            dropdown.querySelector('.dropdown-content').style.display = 'none';
        });
    });

    // --- CÓDIGO PARA O HEADER FIXO E DISCRETO AO ROLAR ---
    const header = document.querySelector('header');

    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
    });

    // --- CÓDIGO PARA ROLAGEM SUAVE PARA A SEÇÃO DE BUSCA ---
    const scrollToSearchButton = document.querySelector('.scroll-to-search');
    if (scrollToSearchButton) {
        scrollToSearchButton.addEventListener('click', function(e) {
            e.preventDefault(); // Impede o comportamento padrão do link
            const searchSection = document.getElementById('searchSection');
            if (searchSection) {
                searchSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }


    // --- CÓDIGO DA FUNÇÃO DE BUSCA DE BATERIAS (COM FILTRO DINÂMICO) ---
    const searchButton = document.getElementById('searchButton');
    const tipoVeiculoSelect = document.getElementById('tipoVeiculo');
    const marcaVeiculoSelect = document.getElementById('marcaVeiculo');
    const modeloVeiculoSelect = document.getElementById('modeloVeiculo');
    const anoVeiculoSelect = document.getElementById('anoVeiculo');
    const searchResultsDiv = document.getElementById('searchResults');

    let bateriasDisponiveis = []; // Array para armazenar todos os dados do JSON

    // Função assíncrona para carregar os dados do arquivo JSON
    async function loadBaterias() {
        try {
            const response = await fetch('baterias.json');
            if (!response.ok) {
                throw new Error(`Erro ao carregar baterias.json! Status: ${response.status}`);
            }
            bateriasDisponiveis = await response.json();
            console.log('✅ Dados de baterias carregados com sucesso:', bateriasDisponiveis);
            // Ao carregar, podemos pré-preencher alguns filtros iniciais se houver valor padrão
            // Ou garantir que todos os selects estão desabilitados até que o tipo seja selecionado.
            resetSearchFilters(true); // Reinicia e desabilita todos exceto o primeiro
        } catch (error) {
            console.error('❌ Não foi possível carregar os dados das baterias:', error);
            searchResultsDiv.innerHTML = '<p>Ocorreu um erro ao carregar as opções de baterias. Por favor, tente novamente mais tarde ou entre em contato.</p>';
        }
    }

    // Chama a função para carregar os dados assim que o DOM estiver completamente carregado
    loadBaterias();

    // Função para resetar os filtros de busca e o estado dos selects
    function resetSearchFilters(disableAll = false) {
        marcaVeiculoSelect.innerHTML = '<option value="">Selecione o Tipo Primeiro</option>';
        modeloVeiculoSelect.innerHTML = '<option value="">Selecione a Marca Primeiro</option>';
        anoVeiculoSelect.innerHTML = '<option value="">Selecione o Modelo Primeiro</option>';

        if (disableAll) {
            marcaVeiculoSelect.disabled = true;
            modeloVeiculoSelect.disabled = true;
            anoVeiculoSelect.disabled = true;
            searchButton.disabled = true;
        } else {
            // Habilita o próximo select (Marca) se o Tipo já foi selecionado
            marcaVeiculoSelect.disabled = (tipoVeiculoSelect.value === '');
        }
        searchResultsDiv.innerHTML = ''; // Limpa resultados anteriores
    }

    // Event Listener para o Tipo de Veículo (primeiro dropdown)
    tipoVeiculoSelect.addEventListener('change', function() {
        const tipoSelecionado = tipoVeiculoSelect.value;
        resetSearchFilters(); // Reseta os filtros dependentes

        if (tipoSelecionado) {
            const marcasUnicas = [...new Set(bateriasDisponiveis
                .filter(bateria => bateria.tipo === tipoSelecionado)
                .map(bateria => bateria.marcaVeiculo)
            )].sort(); // Obter marcas únicas e ordenar

            marcaVeiculoSelect.innerHTML = '<option value="">Selecione</option>';
            marcasUnicas.forEach(marca => {
                const option = document.createElement('option');
                option.value = marca;
                option.textContent = marca.charAt(0).toUpperCase() + marca.slice(1); // Capitaliza a primeira letra
                marcaVeiculoSelect.appendChild(option);
            });
            marcaVeiculoSelect.disabled = false;
        } else {
            resetSearchFilters(true); // Desabilita tudo se o tipo for "Selecione"
        }
        searchButton.disabled = true; // Desabilita o botão de busca até que todos os campos sejam preenchidos
    });

    // Event Listener para a Marca do Veículo
    marcaVeiculoSelect.addEventListener('change', function() {
        const tipoSelecionado = tipoVeiculoSelect.value;
        const marcaSelecionada = marcaVeiculoSelect.value;

        // Resetar Modelo e Ano, mas manter Marca habilitada
        modeloVeiculoSelect.innerHTML = '<option value="">Selecione a Marca Primeiro</option>';
        anoVeiculoSelect.innerHTML = '<option value="">Selecione o Modelo Primeiro</option>';
        modeloVeiculoSelect.disabled = true;
        anoVeiculoSelect.disabled = true;
        searchButton.disabled = true;

        if (tipoSelecionado && marcaSelecionada) {
            const modelosUnicos = [...new Set(bateriasDisponiveis
                .filter(bateria => bateria.tipo === tipoSelecionado && bateria.marcaVeiculo === marcaSelecionada)
                .map(bateria => bateria.modeloVeiculo)
            )].sort();

            modeloVeiculoSelect.innerHTML = '<option value="">Selecione</option>';
            modelosUnicos.forEach(modelo => {
                const option = document.createElement('option');
                option.value = modelo;
                option.textContent = modelo.charAt(0).toUpperCase() + modelo.slice(1);
                modeloVeiculoSelect.appendChild(option);
            });
            modeloVeiculoSelect.disabled = false;
        }
    });

    // Event Listener para o Modelo do Veículo
    modeloVeiculoSelect.addEventListener('change', function() {
        const tipoSelecionado = tipoVeiculoSelect.value;
        const marcaSelecionada = marcaVeiculoSelect.value;
        const modeloSelecionado = modeloVeiculoSelect.value;

        // Resetar Ano
        anoVeiculoSelect.innerHTML = '<option value="">Selecione o Modelo Primeiro</option>';
        anoVeiculoSelect.disabled = true;
        searchButton.disabled = true;

        if (tipoSelecionado && marcaSelecionada && modeloSelecionado) {
            // Obter anos únicos e ordená-los
            const anosUnicos = [...new Set(bateriasDisponiveis
                .filter(bateria =>
                    bateria.tipo === tipoSelecionado &&
                    bateria.marcaVeiculo === marcaSelecionada &&
                    bateria.modeloVeiculo === modeloSelecionado
                )
                .flatMap(bateria => {
                    const anos = [];
                    for (let y = bateria.anoMin; y <= bateria.anoMax; y++) {
                        anos.push(y);
                    }
                    return anos;
                })
            )].sort((a, b) => b - a); // Ordenar do mais novo para o mais antigo

            anoVeiculoSelect.innerHTML = '<option value="">Selecione</option>';
            anosUnicos.forEach(ano => {
                const option = document.createElement('option');
                option.value = ano;
                option.textContent = ano;
                anoVeiculoSelect.appendChild(option);
            });
            anoVeiculoSelect.disabled = false;
        }
    });

    // Event Listener para o Ano do Veículo (habilitar o botão de busca)
    anoVeiculoSelect.addEventListener('change', function() {
        // Habilita o botão de busca apenas se Tipo, Marca, Modelo e Ano tiverem valores selecionados
        searchButton.disabled = !(tipoVeiculoSelect.value && marcaVeiculoSelect.value && modeloVeiculoSelect.value && anoVeiculoSelect.value);
    });

    // Event listener para o botão de busca (a lógica de filtro continua a mesma)
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            console.log('Botão "Buscar" clicado!');
            const tipo = tipoVeiculoSelect.value.toLowerCase();
            const marca = marcaVeiculoSelect.value.toLowerCase().trim();
            const modelo = modeloVeiculoSelect.value.toLowerCase().trim();
            const ano = parseInt(anoVeiculoSelect.value);

            if (bateriasDisponiveis.length === 0) {
                searchResultsDiv.innerHTML = '<p>Os dados das baterias ainda não foram carregados ou houve um erro. Por favor, aguarde ou recarregue a página.</p>';
                console.warn('Tentativa de busca com array de baterias vazio.');
                return;
            }

            let resultados = bateriasDisponiveis.filter(bateria => {
                let match = true;

                if (tipo && bateria.tipo !== tipo) {
                    match = false;
                }
                if (marca && bateria.marcaVeiculo !== marca) { // Alterado para correspondência exata para dropdown
                    match = false;
                }
                if (modelo && bateria.modeloVeiculo !== modelo) { // Alterado para correspondência exata para dropdown
                    match = false;
                }
                if (ano && (ano < bateria.anoMin || ano > bateria.anoMax)) {
                    match = false;
                }
                return match;
            });

            displayResults(resultados);
        });
    } else {
        console.error('Elemento com ID "searchButton" não encontrado no DOM.');
    }


    function displayResults(results) {
        searchResultsDiv.innerHTML = ''; // Limpa resultados anteriores

        if (results.length > 0) {
            results.forEach(bateria => {
                const bateriaHtml = `
                    <div class="bateria-item">
                        <img src="${bateria.imagem}" alt="${bateria.bateria}" onerror="this.onerror=null;this.src='https://placehold.co/60x60/cccccc/333333?text=Bateria'">
                        <div class="bateria-info">
                            <h4>${bateria.bateria}</h4>
                            <p>${bateria.descricao}</p>
                            <p>Compatível com: ${bateria.marcaVeiculo.charAt(0).toUpperCase() + bateria.marcaVeiculo.slice(1)} ${bateria.modeloVeiculo.charAt(0).toUpperCase() + bateria.modeloVeiculo.slice(1)} (${bateria.anoMin}-${bateria.anoMax})</p>
                            <p>Entrega e instalação grátis! <a href="https://api.whatsapp.com/send?phone=5585999999999&text=Olá! Encontrei a bateria ${bateria.bateria} pelo site. Gostaria de mais informações." target="_blank" class="cta-button" style="display:inline-block; margin-top: 10px; padding: 8px 15px; font-size: 0.9em;">Fale Conosco no WhatsApp</a></p>
                        </div>
                    </div>
                `;
                searchResultsDiv.innerHTML += bateriaHtml;
            });
        } else {
            searchResultsDiv.innerHTML = '<p>Nenhuma bateria encontrada com os critérios informados. Por favor, ajuste sua busca ou <a href="https://api.whatsapp.com/send?phone=5585999999999&text=Olá! Não encontrei a bateria para meu veículo no site. Poderiam me ajudar?" target="_blank">fale conosco no WhatsApp</a> para obter ajuda!</p>';
        }
    }
});