# Meu Treino — 6 semanas

Site estático e responsivo para registrar musculação, corrida, descanso, recuperação e evolução.

## Recursos


- Seção completa de avaliação física com peso, altura e circunferências.
- Guia de pontos anatômicos para cintura, abdômen, quadril, braços, coxas, panturrilhas e tórax/busto.
- Registro bilateral para braços, coxas e panturrilhas.
- Fotos padronizadas de frente, perfil e costas.
- Compressão automática das fotos antes de armazenar.
- Comparação automática entre as duas avaliações mais recentes.
- Backup completo em JSON, incluindo as fotos armazenadas.

- Plano de 6 semanas.
- Registro individual de carga, repetições, RPE e conclusão de cada série.
- Contador de séries concluídas por exercício.
- Cronômetro automático após cada série, com pausa, ajuste, reinício, alerta sonoro e vibração.
- Corridas A e B com progressão semanal.
- Agenda com “Fiz” e “Descansei”.
- Check-in de sono, energia, dores e estresse.
- Histórico de medidas.
- Gráficos de carga e corrida.
- Backup por exportação/importação de JSON.

- Banco de dados local IndexedDB com gravação automática.
- Migração automática dos dados antigos armazenados no navegador.
- Histórico normalizado de séries por exercício, semana, carga, repetições e RPE.
- Avaliação automática entre as duas sessões mais recentes de cada exercício.
- Cálculo de variação percentual de carga máxima, repetições totais, média de repetições por série e volume total.
- Classificação automática de evolução positiva, estabilidade, progressão mista ou queda de desempenho.
- Dados salvos no banco IndexedDB do navegador, com cópia de reserva local.
- Funciona como aplicativo instalável (PWA) quando publicado via HTTPS.

## Publicar no GitHub Pages

1. Crie um repositório novo no GitHub.
2. Envie todos os arquivos desta pasta para a raiz do repositório.
3. No repositório, abra **Settings → Pages**.
4. Em **Build and deployment**, escolha **Deploy from a branch**.
5. Selecione a branch `main`, pasta `/ (root)` e salve.
6. Aguarde a publicação e abra o endereço informado pelo GitHub Pages.

## Testar no computador

Abrir `index.html` diretamente funciona para a maioria dos recursos. Para testar instalação/offline, use um servidor local:

```bash
python -m http.server 8000
```

Depois abra `http://localhost:8000`.

## Importante

O site usa um banco IndexedDB local e não exige login. Cada aparelho/navegador mantém seu próprio histórico. Use **Dados → Exportar backup** regularmente.
