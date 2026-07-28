# Meu Treino — 6 semanas

Site estático e responsivo para registrar musculação, corrida, descanso, recuperação e evolução.

## Recursos

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
- Dados salvos somente no navegador (`localStorage`).
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

O site não usa banco de dados nem login. Cada aparelho/navegador mantém seu próprio histórico. Use **Dados → Exportar backup** regularmente.
