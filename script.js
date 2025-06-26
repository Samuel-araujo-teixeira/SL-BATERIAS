document.addEventListener('DOMContentLoaded', function() {
    // ... (resto do seu código existente do carrossel, dropdown e cabeçalho) ...

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

            // *** IMPORTANTE: Agora que os dados foram carregados, anexe os event listeners ou habilite a lógica inicial ***
            attachSearchEventListeners(); // Chama uma função para anexar os event listeners
        } catch (error) {
            console.error('❌ Não foi possível carregar os dados das baterias:', error);
            searchResultsDiv.innerHTML = '<p>Ocorreu um erro ao carregar as opções de baterias. Por favor, tente novamente mais tarde ou entre em contato.</p>';
        }
    }

    // Nova função para anexar os event listeners depois que os dados forem carregados
    function attachSearchEventListeners() {
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
    }

    // Chama a função para carregar os dados assim que o DOM estiver completamente carregado
    loadBaterias();

    // ... (resto da sua função displayResults existente) ...
});