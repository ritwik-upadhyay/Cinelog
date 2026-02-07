document.addEventListener("DOMContentLoaded", () => {

    /* ------------------ ELEMENTS ------------------ */
    const cover = document.getElementById("cover");
    const log = document.getElementById("log");
    const indexView = document.getElementById("index");

    const openLogBtn = document.getElementById("openLog");
    const openIndexBtn = document.getElementById("openIndex");
    const backToCoverBtn = document.getElementById("backToCover");

    const nextBtn = document.getElementById("flipPage");
    const prevBtn = document.getElementById("prevPage");
    const pageNumber = document.getElementById("pageNumber");

    const indexBody = document.getElementById("indexBody");
    const sealEl = document.querySelector(".wax-seal");

    const fields = {
        movie: document.querySelector("input[type='text']"),
        year: document.querySelectorAll("input[type='text']")[1],
        date: document.querySelectorAll("input[type='text']")[2],
        director: document.querySelectorAll("input[type='text']")[3],
        starring: document.querySelectorAll("input[type='text']")[4],
        notes: document.querySelector("textarea")
    };

    const flags = {
        theater: document.getElementById("theater"),
        home: document.getElementById("home"),
        first: document.getElementById("first"),
        rewatch: document.getElementById("rewatch"),
        alone: document.getElementById("alone"),
        with: document.getElementById("withPerson"),
        where: document.getElementById("wherePerson")
    };


    /* ------------------ STATE ------------------ */
    const STORAGE_KEY = "cinelog";

    function defaultState() {
        return {
            pages: [
                {
                    movie: "",
                    year: "",
                    date: "",
                    director: "",
                    starring: "",
                    notes: "",
                    flags: {
                        theater: false,
                        home: false,
                        first: false,
                        rewatch: false,
                        alone: false,
                        with: ""
                    },
                    locked: false
                }
            ],
            currentPage: 0
        };
    }

    let state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultState();

    function saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    /* ------------------ NAVIGATION ------------------ */
    function showCover() {
        cover.style.display = "flex";
        log.style.display = "none";
        indexView.style.display = "none";
    }

    function showLog() {
        cover.style.display = "none";
        indexView.style.display = "none";
        log.style.display = "flex";
        loadPage();
    }

    function showIndex() {
        cover.style.display = "none";
        log.style.display = "none";
        indexView.style.display = "flex";
        renderIndex();
    }

    /* ------------------ PAGE LOGIC ------------------ */
    function loadPage() {
        const page = state.pages[state.currentPage];

        Object.keys(fields).forEach(key => {
            fields[key].value = page[key];
            fields[key].disabled = page.locked;
        });
        Object.keys(flags).forEach(key => {
            if (key === "with" || key === "where") {
                flags[key].value = page.flags[key] || "";
                flags[key].disabled = page.locked;
            } else {
                flags[key].checked = page.flags[key];
                flags[key].disabled = page.locked;
            }
        });

        document.querySelector(".page").classList.toggle("locked", page.locked);

        if (pageNumber) {
            pageNumber.textContent = `Page ${state.currentPage + 1} of ${state.pages.length}`;
        }
    }

    function autosave() {
        const page = state.pages[state.currentPage];
        if (page.locked) return;

        Object.keys(fields).forEach(key => {
            page[key] = fields[key].value;
        });
        Object.keys(flags).forEach(key => {
            if (key === "with" || key === "where") {
                page.flags[key] = flags[key].value;
            } else {
                page.flags[key] = flags[key].checked;
            }
        });




        saveState();
    }

    Object.values(fields).forEach(input => {
        input.addEventListener("input", autosave);
    });

    Object.values(flags).forEach(el => {
        el.addEventListener("input", autosave);
        el.addEventListener("change", autosave);
    });



    /* ------------------ FLIP ------------------ */
    nextBtn.addEventListener("click", () => {
        if (state.currentPage < state.pages.length - 1) {
            state.currentPage++;
            saveState();
            loadPage();
        }
    });

    prevBtn.addEventListener("click", () => {
        if (state.currentPage > 0) {
            state.currentPage--;
            saveState();
            loadPage();
        }
    });

    /* ------------------ INDEX ------------------ */
    function renderIndex() {
        indexBody.innerHTML = "";

        state.pages.forEach((page, i) => {
            if (!page.locked) return;

            const row = document.createElement("tr");
            row.innerHTML = `
        <td>${page.movie}</td>
        <td>${page.year}</td>
        <td>${page.date}</td>
        <td>${page.director}</td>
      `;

            row.addEventListener("click", () => {
                state.currentPage = i;
                saveState();
                showLog();
            });

            indexBody.appendChild(row);
        });
    }

    /* ------------------ BUTTONS ------------------ */
    openLogBtn.onclick = showLog;
    openIndexBtn.onclick = showIndex;
    backToCoverBtn.onclick = showCover;

    /* ------------------ INIT ------------------ */
    showCover();

    /* ------------------ FINISH ENTRY ------------------ */
    const finishBtn = document.getElementById("finishEntry");

    finishBtn.addEventListener("click", () => {
        const page = state.pages[state.currentPage];

        if (!page.movie) {
            alert("Movie title required before finishing.");
            return;
        }

        page.locked = true;

        state.pages.push({
            movie: "",
            year: "",
            date: "",
            director: "",
            starring: "",
            notes: "",
            flags: {
                theater: false,
                home: false,
                first: false,
                rewatch: false,
                alone: false,
                with: ""
            },
            locked: false
        });

        state.currentPage = state.pages.length - 1;

        saveState();
        loadPage();
        renderIndex();

        if (sealEl) {
            sealEl.classList.remove("seal-pop");
            void sealEl.offsetWidth;
            sealEl.classList.add("seal-pop");
        }
    });
});
