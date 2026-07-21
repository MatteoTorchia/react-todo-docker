# Todo App Full-Stack

Una Todo App completa basata su un'architettura 3-Tier (Frontend, Backend, Database), interamente containerizzata con Docker.

## Architettura del Progetto

Il progetto è diviso in tre servizi principali orchestrati tramite **Docker Compose**:

1. **Frontend (React + Vite + Nginx)**
   - Interfaccia utente interattiva per la gestione delle note.
   - Compilata con Vite e servita in produzione tramite un server Nginx leggero.
   - Esposta sulla porta `8080`.

2. **Backend (Node.js + Express)**
   - API RESTful che fa da ponte tra il frontend e il database.
   - Esposta sulla porta `5000`.

3. **Database (MySQL 8.0)**
   - Database relazionale per il salvataggio persistente dei Todo.
   - I dati sono salvati su un Docker Volume (`mysql_data`) per garantirne la persistenza anche dopo lo spegnimento dei container.
   - Esposta sulla porta `3307` (mappata sulla `3306` interna per evitare conflitti locali).

---

## Come avviare il progetto (Setup)

### Prerequisiti

- [Docker](https://www.docker.com/) e Docker Compose installati sul proprio computer.
- Assicurarsi che le porte `8080`, `5000` e `3307` siano libere.

### Installazione e Avvio

1. Apri il terminale nella cartella principale del progetto.
2. Esegui il comando per costruire le immagini e avviare i container in background:

   ```bash
   docker compose up -d --build
   ```

3. Apri il browser e visita: **`http://localhost:8080`**

### Comandi utili

- **Fermare l'app:** `docker compose down`
- **Vedere i log del backend:** `docker compose logs -f backend`
- **Cancellare i dati (reset totale):** `docker compose down -v`

---

## API Disponibili

Il backend espone le seguenti API RESTful all'indirizzo `http://localhost:5000`:

| Metodo | Endpoint | Descrizione | Body Richiesta |
| --- | --- | --- | --- |
| **GET** | `/api/todos` | Restituisce la lista di tutti i Todo | - |
| **POST** | `/api/todos` | Crea un nuovo Todo | `{ "text": "Nuova nota" }` |
| **PUT** | `/api/todos/:id` | Aggiorna lo stato (completato/da fare) | `{ "completed": true }` |
| **DELETE** | `/api/todos/:id` | Elimina un Todo tramite il suo ID | - |

---

## Decisioni Tecniche

Durante lo sviluppo sono state prese le seguenti decisioni architetturali:

*   **Sincronizzazione Avvio (Connect with Retry):** Poiché il container MySQL impiega alcuni secondi in più ad avviarsi rispetto a Node.js, è stata implementata una funzione di *retry* nel backend. Node.js tenta la connessione ogni 3 secondi finché il database non è pronto, evitando crash del container all'avvio.
*   **Creazione automatica delle tabelle:** Il backend è istruito per eseguire un `CREATE TABLE IF NOT EXISTS` al momento della connessione riuscita. Questo elimina la necessità di configurare il database manualmente.
*   **Gestione delle Porte:** La porta esterna di MySQL è stata mappata sulla `3307` anziché `3306` per prevenire conflitti con eventuali istanze di MySQL/MariaDB già installate sul computer host.
*   **Nginx per React:** Anziché usare il server di sviluppo di Node per servire React in produzione, è stato utilizzato Nginx (tramite architettura multi-stage nel Dockerfile). Questo rende il caricamento della pagina web molto più rapido e sicuro.