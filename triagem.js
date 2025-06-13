// Sintomas e condições para triagem
        const sintomas = [
            { texto: 'Dor no peito intensa', peso: 5, categoria: 'cardiovascular' },
            { texto: 'Dificuldade respiratória severa', peso: 5, categoria: 'respiratorio' },
            { texto: 'Perda de consciência', peso: 5, categoria: 'neurologico' },
            { texto: 'Convulsões', peso: 5, categoria: 'neurologico' },
            { texto: 'Hemorragia intensa', peso: 5, categoria: 'trauma' },
            { texto: 'Queimaduras extensas', peso: 4, categoria: 'trauma' },
            { texto: 'Fratura exposta', peso: 4, categoria: 'trauma' },
            { texto: 'Vômitos com sangue', peso: 4, categoria: 'gastro' },
            { texto: 'Dor abdominal intensa', peso: 3, categoria: 'gastro' },
            { texto: 'Febre alta (>39°C)', peso: 3, categoria: 'infeccioso' },
            { texto: 'Dor de cabeça severa', peso: 3, categoria: 'neurologico' },
            { texto: 'Tontura/vertigem', peso: 2, categoria: 'neurologico' },
            { texto: 'Náuseas/vômitos', peso: 2, categoria: 'gastro' },
            { texto: 'Tosse persistente', peso: 2, categoria: 'respiratorio' },
            { texto: 'Diarreia', peso: 1, categoria: 'gastro' },
            { texto: 'Resfriado comum', peso: 1, categoria: 'respiratorio' }
        ];

        let sintomasSelecionados = [];

        // Carregar sintomas na interface
        function carregarSintomas() {
            const container = document.getElementById('sintomasContainer');
            sintomas.forEach((sintoma, index) => {
                const div = document.createElement('div');
                div.className = 'col-md-6 mb-2';
                div.innerHTML = `
                    <div class="form-check sintoma-item p-2 rounded" onclick="toggleSintoma(${index})">
                        <input class="form-check-input" type="checkbox" id="sintoma${index}">
                        <label class="form-check-label" for="sintoma${index}">
                            ${sintoma.texto}
                        </label>
                    </div>
                `;
                container.appendChild(div);
            });
        }

        // Toggle sintoma selecionado
        function toggleSintoma(index) {
            const checkbox = document.getElementById(`sintoma${index}`);
            const div = checkbox.closest('.sintoma-item');
            
            checkbox.checked = !checkbox.checked;
            
            if (checkbox.checked) {
                div.classList.add('sintoma-selecionado');
                if (!sintomasSelecionados.includes(index)) {
                    sintomasSelecionados.push(index);
                }
            } else {
                div.classList.remove('sintoma-selecionado');
                sintomasSelecionados = sintomasSelecionados.filter(i => i !== index);
            }
        }

        // Função de triagem
        function realizarTriagem() {
            const idade = parseInt(document.getElementById('idade').value) || 0;
            const pressaoSist = parseInt(document.getElementById('pressaoSist').value) || 0;
            const pressaoDiast = parseInt(document.getElementById('pressaoDiast').value) || 0;
            const frequenciaCard = parseInt(document.getElementById('frequenciaCard').value) || 0;
            const temperatura = parseFloat(document.getElementById('temperatura').value) || 0;
            const saturacao = parseInt(document.getElementById('saturacao').value) || 100;
            const frequenciaResp = parseInt(document.getElementById('frequenciaResp').value) || 0;
            const escalaDor = parseInt(document.getElementById('escalaDor').value) || 0;

            let pontuacao = 0;
            let prioridade = 'AZUL';
            let tempoEspera = '240 minutos';
            let cor = 'triagem-azul';
            let icone = 'fa-clock';

            // Avaliação dos sintomas selecionados
            sintomasSelecionados.forEach(index => {
                pontuacao += sintomas[index].peso;
            });

            // Avaliação dos sinais vitais críticos
            if (pressaoSist > 180 || pressaoSist < 90) pontuacao += 3;
            if (pressaoDiast > 110 || pressaoDiast < 60) pontuacao += 2;
            if (frequenciaCard > 120 || frequenciaCard < 50) pontuacao += 2;
            if (temperatura > 39 || temperatura < 35) pontuacao += 2;
            if (saturacao < 90) pontuacao += 4;
            if (frequenciaResp > 24 || frequenciaResp < 12) pontuacao += 2;
            if (escalaDor >= 8) pontuacao += 3;
            if (escalaDor >= 6) pontuacao += 2;

            // Fatores de idade
            if (idade < 2 || idade > 65) pontuacao += 1;

            // Classificação final
            if (pontuacao >= 8) {
                prioridade = 'VERMELHO - EMERGÊNCIA';
                tempoEspera = 'IMEDIATO';
                cor = 'triagem-vermelho';
                icone = 'fa-exclamation-triangle';
            } else if (pontuacao >= 6) {
                prioridade = 'LARANJA - MUITO URGENTE';
                tempoEspera = '15 minutos';
                cor = 'triagem-laranja';
                icone = 'fa-exclamation';
            } else if (pontuacao >= 4) {
                prioridade = 'AMARELO - URGENTE';
                tempoEspera = '60 minutos';
                cor = 'triagem-amarelo';
                icone = 'fa-clock';
            } else if (pontuacao >= 2) {
                prioridade = 'VERDE - POUCO URGENTE';
                tempoEspera = '120 minutos';
                cor = 'triagem-verde';
                icone = 'fa-check-circle';
            }

            // Exibir resultado
            const resultado = document.getElementById('resultadoTriagem');
            const nome = document.getElementById('nomePaciente').value || 'Paciente';
            
            resultado.innerHTML = `
                <div class="resultado-triagem ${cor}">
                    <div class="prioridade-icon">
                        <i class="fas ${icone}"></i>
                    </div>
                    <div><strong>${nome}</strong></div>
                    <div class="mt-2">${prioridade}</div>
                    <div class="tempo-espera">Tempo máximo de espera: ${tempoEspera}</div>
                    <div class="mt-3" style="font-size: 0.9em;">
                        Pontuação: ${pontuacao} pontos
                    </div>
                </div>
                <div class="mt-3">
                    <h6>Orientações:</h6>
                    <ul class="list-unstyled">
                        ${getOrientacoes(prioridade)}
                    </ul>
                </div>
            `;
        }

        function getOrientacoes(prioridade) {
            if (prioridade.includes('VERMELHO')) {
                return `
                    <li><i class="fas fa-arrow-right text-danger"></i> Atendimento médico IMEDIATO</li>
                    <li><i class="fas fa-arrow-right text-danger"></i> Dirija-se ao pronto-socorro</li>
                    <li><i class="fas fa-arrow-right text-danger"></i> Considere chamar ambulância (192)</li>
                `;
            } else if (prioridade.includes('LARANJA')) {
                return `
                    <li><i class="fas fa-arrow-right text-warning"></i> Atendimento prioritário necessário</li>
                    <li><i class="fas fa-arrow-right text-warning"></i> Procure o pronto-socorro</li>
                    <li><i class="fas fa-arrow-right text-warning"></i> Não tome medicamentos por conta própria</li>
                `;
            } else if (prioridade.includes('AMARELO')) {
                return `
                    <li><i class="fas fa-arrow-right text-warning"></i> Atendimento médico necessário</li>
                    <li><i class="fas fa-arrow-right text-warning"></i> Pode aguardar na unidade de saúde</li>
                    <li><i class="fas fa-arrow-right text-warning"></i> Monitore os sintomas</li>
                `;
            } else if (prioridade.includes('VERDE')) {
                return `
                    <li><i class="fas fa-arrow-right text-success"></i> Atendimento ambulatorial</li>
                    <li><i class="fas fa-arrow-right text-success"></i> Pode aguardar o atendimento</li>
                    <li><i class="fas fa-arrow-right text-success"></i> Considere UBS se não urgente</li>
                `;
            } else {
                return `
                    <li><i class="fas fa-arrow-right text-primary"></i> Atendimento ambulatorial</li>
                    <li><i class="fas fa-arrow-right text-primary"></i> Considere UBS ou consulta agendada</li>
                    <li><i class="fas fa-arrow-right text-primary"></i> Cuidados domiciliares podem ser suficientes</li>
                `;
            }
        }

        // Event listener para o formulário
        document.getElementById('triagemForm').addEventListener('submit', function(e) {
            e.preventDefault();
            realizarTriagem();
        });

        // Carregar sintomas ao inicializar a página
        carregarSintomas();

async function atualizar() {
      const res = await fetch("http://127.0.0.1:1880/api/sala");
      const dados = await res.json();

      document.getElementById("presence").innerText = dados.presence === "1" ? "Detectada" : "Nenhuma";
      document.getElementById("temp").innerText = dados.temperature;
      document.getElementById("hum").innerText = dados.humidity;
    }

    setInterval(atualizar, 5000);
    atualizar();