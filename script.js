console.log("✅ script.js загружен");

/* ================= ПЕРЕМЕННЫЕ МАГАЗИНА ================= */

let userFrames = {
    owned: [],
    active: null
};

let userAvatars = {
    owned: [],
    active: null
};

/* ================= ОСОБЫЕ ПОЛЬЗОВАТЕЛИ ================= */

const ADMIN_EMAILS = [
    "ivan.dumenov@mail.ru"
];

const FRIEND_EMAILS = [
    "dumenovandrej7@gmail.com",
    "donaterkir@gmail.com",
    "the.velsenly@gmail.com"
];

const SUPER_USERS = [
    ...ADMIN_EMAILS,
    ...FRIEND_EMAILS
];

// 🧟 Кому доступна ЗОМБИ-рамка и ЗОМБИ-аватарка
const ZOMBIE_ACCESS_EMAILS = [
    "ivan.dumenov@mail.ru",
    "donaterkir@gmail.com"
];

// 🔥 Кому доступна АДМИНСКАЯ рамка 
const ADMIN_ACCESS_EMAILS = [
    "ivan.dumenov@mail.ru"
];

function isZombieUser(email) {
    if (!email) return false;
    return ZOMBIE_ACCESS_EMAILS.map(e => e.toLowerCase()).includes(email.toLowerCase());
}

function isAdminFrameUser(email) {
    if (!email) return false;
    return ADMIN_ACCESS_EMAILS.map(e => e.toLowerCase()).includes(email.toLowerCase());
}

// Старое для совместимости
const SPECIAL_FRAME_EMAILS = ZOMBIE_ACCESS_EMAILS;
const FRAME_OWNER_EMAILS = ZOMBIE_ACCESS_EMAILS;
function isSpecialFrameUser(email) {
    return isZombieUser(email);
}
function isFrameOwner(email) {
    return isZombieUser(email);
}

function isSuperUser(email) {
    if (!email) return false;
    return SUPER_USERS.map(e => e.toLowerCase()).includes(email.toLowerCase());
}

function isAdminUser(email) {
    if (!email) return false;
    return ADMIN_EMAILS.map(e => e.toLowerCase()).includes(email.toLowerCase());
}

function isFriendUser(email) {
    if (!email) return false;
    return FRIEND_EMAILS.map(e => e.toLowerCase()).includes(email.toLowerCase());
}

function isForbiddenName(name) {
    const clean = name.toLowerCase().replace(/[^a-zа-яё0-9]/gi, "");
    const forbiddenRoots = [
        "админ", "admin", "adm", "amin", "admn", "adm1n", "4dmin",
        "аdмин", "admин", "aдмин", "аdmin", "адmин", "admіn",
        "admln", "adrnin", "αdmin", "👑"
    ];
    return forbiddenRoots.some(root => clean.includes(root));
}

function isForbiddenNick(nick) {
    const clean = nick.toLowerCase().replace(/[^a-zа-яё0-9_]/gi, "");
    if (clean.includes("admin") || clean.includes("админ")) return true;
    return false;
}

function isValidNick(nick) {
    if (!nick) return false;
    return /^[a-zA-Zа-яА-ЯёЁ0-9_]{3,20}$/.test(nick);
}

/* ================= РЕЦЕПТЫ ================= */

const recipes = [
    {
        id: 1, name: "Паста болоньезе", cat: "Ужины", time: "30 мин", tag: "Легко",
        desc: "Классика итальянской кухни с ароматным томатным соусом.",
        img: "images/pasta.png",
        ingredients: ["паста", "фарш", "томаты", "лук", "чеснок"],
        steps: [
            "Нарежьте лук и чеснок мелко",
            "Обжарьте лук с чесноком на масле до золотистого цвета",
            "Добавьте фарш и обжарьте до готовности",
            "Добавьте томаты и тушите 15 минут на среднем огне",
            "Отварите пасту, смешайте с соусом и подавайте"
        ]
    },
    {
        id: 2, name: "Курица с овощами в духовке", cat: "Ужины", time: "40 мин", tag: "Средне",
        desc: "Сочная курица с запечёнными овощами.",
        img: "images/chicken.png",
        ingredients: ["курица", "картофель", "перец", "морковь"],
        steps: [
            "Разогрейте духовку до 200°C",
            "Нарежьте картофель, морковь и перец крупно",
            "Смешайте овощи с маслом, солью и специями",
            "Выложите курицу на противень и засыпьте овощами",
            "Запекайте 40 минут до золотистой корочки"
        ]
    },
    {
        id: 3, name: "Панкейки на молоке", cat: "Завтраки", time: "20 мин", tag: "Легко",
        desc: "Нежные и воздушные панкейки для уютного утра.",
        img: "images/pancakes.png",
        ingredients: ["мука", "молоко", "яйца", "сахар"],
        steps: [
            "Смешайте муку, сахар и яйца в миске",
            "Влейте молоко и взбейте венчиком до однородности",
            "Разогрейте сковороду и налейте тесто небольшими порциями",
            "Обжарьте по 2 минуты с каждой стороны до золотистого цвета",
            "Подавайте с ягодами, мёдом или сиропом"
        ]
    },
    {
        id: 4, name: "Томатный суп", cat: "Обеды", time: "35 мин", tag: "Средне",
        desc: "Яркий суп с ароматом томатов и свежей зеленью.",
        img: "images/soup.png",
        ingredients: ["томаты", "лук", "чеснок", "сливки", "зелень"],
        steps: [
            "Нарежьте лук и чеснок",
            "Обжарьте на масле до мягкости",
            "Добавьте томаты и тушите 15 минут",
            "Влейте сливки, пробейте суп блендером до однородности",
            "Подавайте с зеленью и сухариками"
        ]
    }
];

let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

const grid = document.querySelector("#recipeGrid");
const recipesPageGrid = document.querySelector("#recipesPageGrid");
const fridgeResults = document.querySelector("#fridgeResults");
const modal = document.querySelector("#modal");
const modalContent = document.querySelector("#modalContent");

function recipeCardHTML(r) {
    return `
    <article class="recipe" data-id="${r.id}">
      <img src="${r.img}" alt="${r.name}">
      <button class="heart" data-fav="${r.id}" title="Избранное">
        ${favorites.includes(r.id) ? "♥" : "♡"}
      </button>
      <div class="recipe-body">
        <div class="meta">◷ ${r.time}<span class="tag">${r.tag}</span></div>
        <h3>${r.name}</h3>
        <p>${r.desc}</p>
        <div class="author">♨ Виртуальный Шеф</div>
      </div>
    </article>`;
}

function renderTo(container, list) {
    if (!container) return;
    if (!list.length) {
        container.innerHTML = `<div class="empty">Ничего не найдено.</div>`;
        return;
    }
    container.innerHTML = list.map(recipeCardHTML).join("");
}

function render(list = recipes) {
    renderTo(grid, list);
    renderTo(recipesPageGrid, list);
}

function openRecipe(id) {
    const r = recipes.find(x => x.id === id);
    if (!r) return;
    modalContent.innerHTML = `
        <h2>${r.name}</h2>
        <p>${r.desc}</p>
        <b>Ингредиенты:</b>
        <ul>${r.ingredients.map(x => `<li>${x}</li>`).join("")}</ul>
        <p><b>Время:</b> ${r.time} · <b>Сложность:</b> ${r.tag}</p>
        <button class="cooking-btn cooking-btn-next" id="startCookingBtn" style="width:100%;margin-top:20px;max-width:none;">
            👨‍🍳 Начать готовить
        </button>`;
    modal.classList.remove("hidden");

    document.querySelector("#startCookingBtn")?.addEventListener("click", () => {
        modal.classList.add("hidden");
        openCookingMode(id);
    });

    const user = currentUser();
    if (user) {
        user.stats.opened++;
        saveCurrentUser(user);
        checkAchievements();
    }
}

function switchTab(name) {
    document.querySelectorAll(".nav-link").forEach(x =>
        x.classList.toggle("active", x.dataset.target === name)
    );
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    const page = document.querySelector("#page-" + name);
    if (page) page.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll(".nav-link").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.target));
});

const brand = document.querySelector(".brand");
if (brand) {
    brand.addEventListener("click", e => {
        e.preventDefault();
        switchTab("home");
    });
}

document.addEventListener("click", e => {
    const fav = e.target.closest("[data-fav]");
    if (fav) {
        const id = +fav.dataset.fav;
        favorites = favorites.includes(id)
            ? favorites.filter(x => x !== id)
            : [...favorites, id];
        localStorage.setItem("favorites", JSON.stringify(favorites));
        render();
        renderTo(fridgeResults, collectFridgeResults());
        setTimeout(() => {
            checkAchievements();
            if (document.querySelector("#page-profile").classList.contains("active")) {
                renderProfile();
            }
        }, 50);
        return;
    }
    const card = e.target.closest(".recipe");
    if (card) openRecipe(+card.dataset.id);
});

document.querySelector("#closeModal").addEventListener("click", () =>
    modal.classList.add("hidden")
);
modal.addEventListener("click", e => {
    if (e.target === modal) modal.classList.add("hidden");
});

document.querySelector("#fridgeOpen").addEventListener("click", () => switchTab("fridge"));
document.querySelector("#allRecipes").addEventListener("click", () => switchTab("recipes"));

document.querySelector("#focusSearch").addEventListener("click", () => {
    if (!document.querySelector("#page-home").classList.contains("active")) {
        switchTab("home");
    }
    setTimeout(() => document.querySelector("#searchInput").focus(), 150);
});

document.querySelector("#searchForm").addEventListener("submit", e => {
    e.preventDefault();
    const q = document.querySelector("#searchInput").value.trim().toLowerCase();
    render(
        q ? recipes.filter(r =>
            (r.name + " " + r.desc + " " + r.cat + " " + r.ingredients.join(" "))
                .toLowerCase().includes(q)
        ) : recipes
    );
    const user = currentUser();
    if (user) {
        user.stats.searches++;
        saveCurrentUser(user);
        checkAchievements();
    }
});

document.querySelector("#openFavorites").addEventListener("click", () => {
    switchTab("recipes");
    renderTo(recipesPageGrid, recipes.filter(r => favorites.includes(r.id)));
});

function currentUser() {
    const email = localStorage.getItem("vc_user_email");
    if (!email) return null;
    return {
        name: localStorage.getItem("vc_user_name") || "Пользователь",
        nick: localStorage.getItem("vc_user_nick") || "",
        email: email,
        registered: parseInt(localStorage.getItem("vc_user_registered") || Date.now()),
        stats: JSON.parse(localStorage.getItem("vc_stats_" + email) || '{"opened":0,"fridgeSearches":0,"searches":0,"recipesPageVisits":0}'),
        achievements: JSON.parse(localStorage.getItem("vc_achv_" + email) || '["first_step"]')
    };
}

function saveCurrentUser(user) {
    if (!user) return;
    localStorage.setItem("vc_user_name", user.name);
    if (user.nick) localStorage.setItem("vc_user_nick", user.nick);
    localStorage.setItem("vc_user_email", user.email);
    localStorage.setItem("vc_stats_" + user.email, JSON.stringify(user.stats));
    localStorage.setItem("vc_achv_" + user.email, JSON.stringify(user.achievements));
}

/* ================= ДОСТИЖЕНИЯ ================= */

const ACHIEVEMENTS = [
    { id: "first_step", icon: "👣", name: "Первый шаг", desc: "Зарегистрировался на сайте" },
    { id: "opened_1", icon: "🍳", name: "Новичок", desc: "Открыл 1 рецепт" },
    { id: "opened_5", icon: "👨‍🍳", name: "Кулинар", desc: "Открыл 5 рецептов" },
    { id: "opened_15", icon: "🔥", name: "Шеф-повар", desc: "Открыл 15 рецептов" },
    { id: "fav_1", icon: "❤️", name: "Первый фаворит", desc: "Добавил рецепт в избранное" },
    { id: "fav_5", icon: "💖", name: "Гурман", desc: "5 рецептов в избранном" },
    { id: "fav_10", icon: "😍", name: "Коллекционер", desc: "10 рецептов в избранном" },
    { id: "fridge_1", icon: "❄️", name: "Ревизор", desc: "Использовал поиск в холодильнике" },
    { id: "fridge_5", icon: "🧊", name: "Хозяин холодильника", desc: "5 поисков в холодильнике" },
    { id: "search_1", icon: "🔎", name: "Искатель", desc: "Воспользовался поиском" },
    { id: "week_1", icon: "📅", name: "Неделя с шефом", desc: "7 дней с нами" },
    { id: "recipes_5", icon: "📖", name: "Книголюб", desc: "Просмотрел раздел всех рецептов" },
    { id: "opened_30", icon: "📚", name: "Знаток", desc: "Открыл 30 рецептов" },
    { id: "fav_20", icon: "❤️‍🔥", name: "Любитель", desc: "20 рецептов в избранном" },
    { id: "search_10", icon: "🔍", name: "Сыщик", desc: "10 поисков в шапке" },
    { id: "fridge_10", icon: "🥶", name: "Морозилка", desc: "10 поисков в холодильнике" },
    { id: "month_1", icon: "🗓️", name: "Постоянный", desc: "30 дней с нами" },
    { id: "rich_1", icon: "💰", name: "Богач", desc: "Накопил 1000 ⭐" },
    { id: "rich_10", icon: "💎", name: "Олигарх", desc: "Накопил 10000 ⭐" },
    { id: "frame_1", icon: "🎨", name: "Первый стиль", desc: "Купил 1 рамку" },
    { id: "frame_3", icon: "🖼️", name: "Мастер стиля", desc: "Купил 3 рамки" },
    { id: "cooked_1", icon: "👨‍🍳", name: "Первое блюдо", desc: "Приготовил 1 рецепт" },
    { id: "cooked_3", icon: "🍳", name: "Повар-любитель", desc: "Приготовил 3 рецепта" },
    { id: "cooked_all", icon: "🥘", name: "Мастер кухни", desc: "Приготовил все рецепты" },
    { id: "friend_1", icon: "🤝", name: "Первый друг", desc: "Добавил 1 друга" },
    { id: "friend_5", icon: "👥", name: "Компания", desc: "5 друзей" },
    { id: "friend_10", icon: "🎉", name: "Тусовщик", desc: "10 друзей" },
    { id: "gifted_1k", icon: "🎁", name: "Щедрый", desc: "Подарил 1000 ⭐ друзьям" },
];

function getAchievementProgress(id) {
    const user = currentUser();
    if (!user) return { current: 0, target: 1 };

    const stats = user.stats || {};
    const favCount = favorites.length;
    const stars = getStars();
    const framesCount = (typeof userFrames !== "undefined" && userFrames.owned)
        ? userFrames.owned.length
        : 0;
    const cookedCount = getCookedRecipes().length;
    const friendsCount = getFriendsCount();
    const giftedStars = getGiftedStars();

    const progress = {
        "first_step": { current: 1, target: 1 },
        "opened_1": { current: Math.min(stats.opened || 0, 1), target: 1 },
        "opened_5": { current: Math.min(stats.opened || 0, 5), target: 5 },
        "opened_15": { current: Math.min(stats.opened || 0, 15), target: 15 },
        "fav_1": { current: Math.min(favCount, 1), target: 1 },
        "fav_5": { current: Math.min(favCount, 5), target: 5 },
        "fav_10": { current: Math.min(favCount, 10), target: 10 },
        "fridge_1": { current: Math.min(stats.fridgeSearches || 0, 1), target: 1 },
        "fridge_5": { current: Math.min(stats.fridgeSearches || 0, 5), target: 5 },
        "search_1": { current: Math.min(stats.searches || 0, 1), target: 1 },
        "week_1": { current: Math.min(daysOnSite(user), 7), target: 7 },
        "recipes_5": { current: Math.min(stats.recipesPageVisits || 0, 1), target: 1 },
        "opened_30": { current: Math.min(stats.opened || 0, 30), target: 30 },
        "fav_20": { current: Math.min(favCount, 20), target: 20 },
        "search_10": { current: Math.min(stats.searches || 0, 10), target: 10 },
        "fridge_10": { current: Math.min(stats.fridgeSearches || 0, 10), target: 10 },
        "month_1": { current: Math.min(daysOnSite(user), 30), target: 30 },
        "rich_1": { current: Math.min(stars, 1000), target: 1000 },
        "rich_10": { current: Math.min(stars, 10000), target: 10000 },
        "frame_1": { current: Math.min(framesCount, 1), target: 1 },
        "frame_3": { current: Math.min(framesCount, 3), target: 3 },
        "cooked_1": { current: Math.min(cookedCount, 1), target: 1 },
        "cooked_3": { current: Math.min(cookedCount, 3), target: 3 },
        "cooked_all": { current: Math.min(cookedCount, recipes.length), target: recipes.length },
        "friend_1": { current: Math.min(friendsCount, 1), target: 1 },
        "friend_5": { current: Math.min(friendsCount, 5), target: 5 },
        "friend_10": { current: Math.min(friendsCount, 10), target: 10 },
        "gifted_1k": { current: Math.min(giftedStars, 1000), target: 1000 },
    };

    return progress[id] || { current: 0, target: 1 };
}

function getProgressColor(percent) {
    if (percent >= 100) return "gold";
    if (percent >= 67) return "green";
    if (percent >= 34) return "yellow";
    return "red";
}

function daysOnSite(user) {
    if (!user || !user.registered) return 1;
    const days = Math.floor((Date.now() - user.registered) / 86400000) + 1;
    return Math.max(1, days);
}

function unlockAchievement(user, id) {
    if (!user.achievements.includes(id)) {
        user.achievements.push(id);
        saveCurrentUser(user);
        const ach = ACHIEVEMENTS.find(a => a.id === id);
        if (ach) showToast(`🏆 Достижение: ${ach.name}`);
        saveAchievementsToCloud(user.achievements);
    }
}

async function saveAchievementsToCloud(achievements) {
    if (!window.firebaseDB) return;
    const user = currentUser();
    if (!user) return;
    try {
        const { db, doc, setDoc } = window.firebaseDB;
        const ref = doc(db, "users", user.email);
        await setDoc(ref, { achievements }, { merge: true });
    } catch (e) {
        console.error("Ошибка сохранения достижений:", e);
    }
}

async function loadAchievementsFromCloud() {
    if (!window.firebaseDB) return;
    const user = currentUser();
    if (!user) return;
    try {
        const { db, doc, getDoc } = window.firebaseDB;
        const ref = doc(db, "users", user.email);
        const snap = await getDoc(ref);
        if (snap.exists()) {
            const data = snap.data();
            const cloudAchievements = data.achievements || [];
            const localAchievements = user.achievements || [];
            const merged = [...new Set([...localAchievements, ...cloudAchievements])];
            if (merged.length > localAchievements.length) {
                user.achievements = merged;
                saveCurrentUser(user);
            }
        }
    } catch (e) {
        console.error("Ошибка загрузки достижений:", e);
    }
}

function checkAchievements() {
    const user = currentUser();
    if (!user) return;

    if (isSuperUser(user.email)) {
        const allIds = ACHIEVEMENTS.map(a => a.id);
        let changed = false;
        allIds.forEach(id => {
            if (!user.achievements.includes(id)) {
                user.achievements.push(id);
                changed = true;
            }
        });
        if (changed) {
            saveCurrentUser(user);
            saveAchievementsToCloud(user.achievements);
        }
        return;
    }

    if (user.stats.opened >= 1) unlockAchievement(user, "opened_1");
    if (user.stats.opened >= 5) unlockAchievement(user, "opened_5");
    if (user.stats.opened >= 15) unlockAchievement(user, "opened_15");

    const favCount = favorites.length;
    if (favCount >= 1) unlockAchievement(user, "fav_1");
    if (favCount >= 5) unlockAchievement(user, "fav_5");
    if (favCount >= 10) unlockAchievement(user, "fav_10");

    if (user.stats.fridgeSearches >= 1) unlockAchievement(user, "fridge_1");
    if (user.stats.fridgeSearches >= 5) unlockAchievement(user, "fridge_5");
    if (user.stats.searches >= 1) unlockAchievement(user, "search_1");
    if (user.stats.recipesPageVisits >= 1) unlockAchievement(user, "recipes_5");
    if (daysOnSite(user) >= 7) unlockAchievement(user, "week_1");

    if (user.stats.opened >= 30) unlockAchievement(user, "opened_30");
    if (favCount >= 20) unlockAchievement(user, "fav_20");
    if (user.stats.searches >= 10) unlockAchievement(user, "search_10");
    if (user.stats.fridgeSearches >= 10) unlockAchievement(user, "fridge_10");
    if (daysOnSite(user) >= 30) unlockAchievement(user, "month_1");

    if (getStars() >= 1000) unlockAchievement(user, "rich_1");
    if (getStars() >= 10000) unlockAchievement(user, "rich_10");

    const framesCount = (typeof userFrames !== "undefined" && userFrames.owned)
        ? userFrames.owned.length
        : 0;
    if (framesCount >= 1) unlockAchievement(user, "frame_1");
    if (framesCount >= 3) unlockAchievement(user, "frame_3");

    const cookedCount = getCookedRecipes().length;
    if (cookedCount >= 1) unlockAchievement(user, "cooked_1");
    if (cookedCount >= 3) unlockAchievement(user, "cooked_3");
    if (cookedCount >= recipes.length) unlockAchievement(user, "cooked_all");

    const friendsCount = getFriendsCount();
    if (friendsCount >= 1) unlockAchievement(user, "friend_1");
    if (friendsCount >= 5) unlockAchievement(user, "friend_5");
    if (friendsCount >= 10) unlockAchievement(user, "friend_10");

    const giftedStars = getGiftedStars();
    if (giftedStars >= 1000) unlockAchievement(user, "gifted_1k");
}

function showToast(text) {
    const el = document.createElement("div");
    el.className = "vc-toast";
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add("show"), 30);
    setTimeout(() => {
        el.classList.remove("show");
        setTimeout(() => el.remove(), 300);
    }, 3000);
}

const toastStyle = document.createElement("style");
toastStyle.textContent = `
.vc-toast {
    position: fixed; bottom: 30px; left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: #df2026; color: #fff;
    padding: 14px 24px; border-radius: 30px;
    font-size: 14px; font-weight: 600;
    box-shadow: 0 10px 30px rgba(223, 32, 38, .4);
    opacity: 0; transition: .3s; z-index: 999;
}
.vc-toast.show {
    opacity: 1; transform: translateX(-50%) translateY(0);
}`;
document.head.appendChild(toastStyle);

function renderProfile() {
    const user = currentUser();
    const authBlock = document.querySelector("#authBlock");
    const userBlock = document.querySelector("#userBlock");

    if (!user) {
        authBlock.classList.remove("hidden");
        userBlock.classList.add("hidden");
        return;
    }

    authBlock.classList.add("hidden");
    userBlock.classList.remove("hidden");

    checkAchievements();
    const freshUser = currentUser();

    const avatarEl = document.querySelector("#profileAvatar");
    avatarEl.setAttribute("data-letter", freshUser.name[0].toUpperCase());

    avatarEl.innerHTML = "";

    if (userAvatars.active) {
        avatarEl.innerHTML = `<img src="images/avatar-${userAvatars.active}.png" alt="avatar">`;
    } else {
        avatarEl.innerHTML = `<span style="position:relative;z-index:5;color:#fff;font-size:44px;font-weight:700;text-shadow:0 2px 6px rgba(0,0,0,.5);">${freshUser.name[0].toUpperCase()}</span>`;
    }

    if (typeof applyActiveFrame === "function") {
        applyActiveFrame();
    }

    const isAdmin = isAdminUser(freshUser.email);
    const isFriend = isFriendUser(freshUser.email);
    const isSuper = isSuperUser(freshUser.email);

    let displayName = freshUser.name;
    if (isAdmin) displayName = "👑 " + freshUser.name;
    else if (isFriend) displayName = "🤝 " + freshUser.name;
    else if (isSuper) displayName = "⭐ " + freshUser.name;

    document.querySelector("#profileName").textContent = displayName;
    document.querySelector("#profileEmail").textContent = "@" + (freshUser.nick || "без_ника") + " · " + freshUser.email;
    document.querySelector("#profileDate").textContent =
        new Date(freshUser.registered).toLocaleDateString("ru-RU");

    document.querySelector("#statOpened").textContent = freshUser.stats.opened;
    document.querySelector("#statFavs").textContent = favorites.length;

    let achvText = `${freshUser.achievements.length}/${ACHIEVEMENTS.length}`;
    if (isSuper) achvText += " ⭐";
    document.querySelector("#statAchv").textContent = achvText;

    document.querySelector("#statDays").textContent = daysOnSite(freshUser);

    const grid = document.querySelector("#achievementsGrid");
    grid.innerHTML = ACHIEVEMENTS.map(a => {
        const unlocked = freshUser.achievements.includes(a.id);
        const prog = getAchievementProgress(a.id);
        const percent = Math.min(100, Math.round((prog.current / prog.target) * 100));
        const color = getProgressColor(percent);

        return `
            <div class="achievement ${unlocked ? "unlocked" : "locked"}">
                <span class="ach-icon">${a.icon}</span>
                <b>${a.name}</b>
                <small>${a.desc}</small>
                <div class="ach-progress">
                    <div class="ach-bar">
                        <div class="ach-fill ${color}" style="width: ${percent}%"></div>
                    </div>
                    <span class="ach-text">${prog.current}/${prog.target}</span>
                </div>
            </div>`;
    }).join("");

    const favContainer = document.querySelector("#profileFavorites");
    const favRecipes = recipes.filter(r => favorites.includes(r.id));
    if (!favRecipes.length) {
        favContainer.innerHTML = `<div class="empty">Пока нет избранных рецептов. Добавляйте ♡ на карточках.</div>`;
    } else {
        renderTo(favContainer, favRecipes);
    }
}

const loginForm = document.querySelector("#loginForm");
const registerForm = document.querySelector("#registerForm");

document.querySelectorAll(".auth-tab").forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".auth-tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        const mode = tab.dataset.auth;
        loginForm.classList.toggle("hidden", mode !== "login");
        registerForm.classList.toggle("hidden", mode !== "register");
    });
});

registerForm?.addEventListener("submit", async e => {
    e.preventDefault();
    const nick = document.querySelector("#regNick").value.trim();
    const name = document.querySelector("#regName").value.trim();
    const email = document.querySelector("#regEmail").value.trim().toLowerCase();
    const password = document.querySelector("#regPassword").value;
    const err = document.querySelector("#regError");

    if (nick.length < 3 || nick.length > 20) {
        err.textContent = "Ник должен быть от 3 до 20 символов";
        return;
    }
    if (!isValidNick(nick)) {
        err.textContent = "Ник может содержать только буквы, цифры и _";
        return;
    }
    if (isForbiddenNick(nick)) {
        err.textContent = "Этот ник запрещён. Придумайте другой.";
        return;
    }
    if (name.length < 2) {
        err.textContent = "Имя слишком короткое";
        return;
    }
    if (isForbiddenName(name)) {
        err.textContent = "Это имя занято или запрещено. Придумайте другое.";
        return;
    }


    try {
        const nickRef = window.firebaseDB.doc(window.firebaseDB.db, "nicks", nick.toLowerCase());
        const nickSnap = await window.firebaseDB.getDoc(nickRef);
        if (nickSnap.exists()) {
            err.textContent = "Этот ник уже занят. Придумайте другой.";
            return;
        }
    } catch (e) {
        console.error("Ошибка проверки ника:", e);
    }

    try {
        err.textContent = "Создаём аккаунт...";
        const userCredential = await window.firebaseAuth.createUserWithEmailAndPassword(
            window.firebaseAuth.auth, email, password
        );
        await window.firebaseAuth.updateProfile(userCredential.user, { displayName: name });
        localStorage.setItem("vc_user_name", name);
        localStorage.setItem("vc_user_nick", nick);
        localStorage.setItem("vc_user_email", email);
        localStorage.setItem("vc_user_registered", Date.now());
        localStorage.setItem("vc_stats_" + email, '{"opened":0,"fridgeSearches":0,"searches":0,"recipesPageVisits":0}');
        localStorage.setItem("vc_achv_" + email, '["first_step"]');
        if (window.firebaseDB) {
            try {
                const { db, doc, setDoc } = window.firebaseDB;
                await setDoc(doc(db, "users", email), {
                    email, name, nick, stars: 0,
                    registered: Date.now(), created: Date.now(),
                    achievements: ["first_step"]
                });
                await setDoc(doc(db, "nicks", nick.toLowerCase()), {
                    email: email,
                    nick: nick
                });
            } catch (e) {
                console.error("❌ Ошибка:", e);
            }
        }
        err.textContent = "";
        registerForm.reset();
        showToast("👋 Добро пожаловать, " + name + "!");
        renderProfile();
    } catch (error) {
        const msgs = {
            "auth/email-already-in-use": "Этот email уже зарегистрирован",
            "auth/invalid-email": "Некорректный email",
            "auth/weak-password": "Пароль слишком простой (минимум 6 символов)",
        };
        err.textContent = msgs[error.code] || "Ошибка: " + error.message;
    }
});

loginForm?.addEventListener("submit", async e => {
    e.preventDefault();
    const email = document.querySelector("#loginEmail").value.trim().toLowerCase();
    const password = document.querySelector("#loginPassword").value;
    const err = document.querySelector("#loginError");
    try {
        err.textContent = "Входим...";
        await window.firebaseAuth.signInWithEmailAndPassword(
            window.firebaseAuth.auth, email, password
        );
        localStorage.setItem("vc_user_email", email);
        if (!localStorage.getItem("vc_user_name")) {
            localStorage.setItem("vc_user_name", "Пользователь");
        }
        err.textContent = "";
        loginForm.reset();
        showToast("👋 С возвращением!");
        renderProfile();
    } catch (error) {
        const msgs = {
            "auth/user-not-found": "Пользователь не найден",
            "auth/wrong-password": "Неверный пароль",
            "auth/invalid-credential": "Неверный email или пароль",
            "auth/invalid-email": "Некорректный email",
        };
        err.textContent = msgs[error.code] || "Ошибка входа";
    }
});

document.querySelector("#logoutBtn")?.addEventListener("click", async () => {
    try {
        await window.firebaseAuth.signOut(window.firebaseAuth.auth);
        localStorage.removeItem("vc_user_email");
        showToast("Вы вышли из аккаунта");
        renderProfile();
    } catch (error) {
        console.error("Ошибка выхода:", error);
    }
});

document.querySelector("#profileBtn").addEventListener("click", () => {
    switchTab("profile");
    renderProfile();
});

document.querySelector("#fridgeSearchForm")?.addEventListener("submit", () => {
    const user = currentUser();
    if (user && document.querySelector("#fridgeInput").value.trim()) {
        user.stats.fridgeSearches++;
        saveCurrentUser(user);
        checkAchievements();
    }
});

document.querySelectorAll('[data-target="recipes"]').forEach(btn => {
    btn.addEventListener("click", () => {
        const user = currentUser();
        if (user) {
            user.stats.recipesPageVisits++;
            saveCurrentUser(user);
            checkAchievements();
        }
    });
});

function setupChips(container, targetGrid) {
    if (!container) return;
    container.addEventListener("click", e => {
        const b = e.target.closest(".chip");
        if (!b) return;
        container.querySelectorAll(".chip").forEach(x => x.classList.remove("active"));
        b.classList.add("active");
        const filtered = b.dataset.cat === "Все"
            ? recipes : recipes.filter(r => r.cat === b.dataset.cat);
        renderTo(targetGrid, filtered);
    });
}

setupChips(document.querySelector("#chips"), grid);
setupChips(document.querySelector("#chipsPage"), recipesPageGrid);

const fridgeForm = document.querySelector("#fridgeSearchForm");
const fridgeInput = document.querySelector("#fridgeInput");

function normalize(word) {
    return word
        .toLowerCase()
        .replace(/[^а-яёa-z0-9]/gi, "")
        .replace(/(ами|ями|ов|ев|ей|ой|ый|ий|ая|яя|ое|ее|ые|ие|у|ю|а|я|ы|и|е|о|ь)$/u, "")
        .trim();
}

function findFridgeRecipes(query) {
    const words = query.split(/[,\s]+/).map(w => normalize(w)).filter(w => w.length >= 3);
    if (!words.length) return [];
    return recipes.filter(r =>
        words.some(w =>
            r.ingredients.some(ing => {
                const normIng = normalize(ing);
                return normIng.includes(w) || w.includes(normIng);
            })
        )
    );
}

function collectFridgeResults() {
    if (!fridgeInput || !fridgeInput.value.trim()) return [];
    return findFridgeRecipes(fridgeInput.value.trim());
}

if (fridgeForm) {
    fridgeForm.addEventListener("submit", e => {
        e.preventDefault();
        const q = fridgeInput.value.trim();
        if (!q) {
            fridgeResults.innerHTML = `<div class="empty">Введите продукты, которые у вас есть.</div>`;
            return;
        }
        const found = findFridgeRecipes(q);
        if (!found.length) {
            fridgeResults.innerHTML = `<div class="empty">Ничего не нашлось. Попробуйте другие продукты.</div>`;
            return;
        }
        renderTo(fridgeResults, found);
    });
}

const allFromFridge = document.querySelector("#allRecipesFromFridge");
if (allFromFridge) {
    allFromFridge.addEventListener("click", () => switchTab("recipes"));
}

render();
renderProfile();


/* ================= FIRESTORE: ЗВЁЗДЫ ================= */

async function loadStarsFromCloud() {
    if (!window.firebaseDB) return;
    const user = currentUser();
    if (!user) return;
    try {
        const { db, doc, getDoc, setDoc } = window.firebaseDB;
        const ref = doc(db, "users", user.email);
        const snap = await getDoc(ref);
        if (snap.exists()) {
            const data = snap.data();
            const cloudStars = data.stars || 0;
            localStorage.setItem("vc_stars", String(cloudStars));
            if (data.registered) {
                localStorage.setItem("vc_user_registered", data.registered);
            }
            if (data.nick) {
                localStorage.setItem("vc_user_nick", data.nick);
            }
        } else {
            const localStars = parseInt(localStorage.getItem("vc_stars") || "0");
            await setDoc(ref, {
                email: user.email, name: user.name,
                stars: localStars, registered: user.registered, created: Date.now()
            });
        }
        updateStarsBalance();
    } catch (e) {
        console.error("Ошибка загрузки:", e);
    }
}

async function saveStarsToCloud(value) {
    localStorage.setItem("vc_stars", String(value));
    updateStarsBalance();
    if (!window.firebaseDB) return;
    const user = currentUser();
    if (!user) return;
    try {
        const { db, doc, setDoc } = window.firebaseDB;
        const ref = doc(db, "users", user.email);
        await setDoc(ref, { stars: value }, { merge: true });
    } catch (e) {
        console.error("Ошибка сохранения:", e);
    }
}

/* ================= КАЛЕНДАРЬ НАГРАД ================= */

const MONTHS = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

function starsForDay(date) {
    const dow = date.getDay();
    return (dow === 0 || dow === 6) ? 30 : 15;
}

function dateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function getClaimed() {
    return JSON.parse(localStorage.getItem("vc_claimed_days") || "{}");
}
function saveClaimed(obj) {
    localStorage.setItem("vc_claimed_days", JSON.stringify(obj));
}
function getStars() {
    return parseInt(localStorage.getItem("vc_stars") || "0");
}

function updateStarsBalance() {
    const el = document.querySelector("#starsCount");
    if (el) el.textContent = getStars();
}

function countStreak() {
    const claimed = getClaimed();
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = dateKey(d);
        if (claimed[key]) streak++;
        else if (i > 0) break;
    }
    return streak;
}

function renderRewards() {
    const tbody = document.querySelector("#rewardsBody");
    if (!tbody) return;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const titleEl = document.querySelector("#rewardsTitle");
    if (titleEl) titleEl.textContent = `${MONTHS[month]} ${year}`;
    tbody.innerHTML = "";
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;
    const claimed = getClaimed();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let monthTotal = 0;
    const allCells = [];
    for (let i = 0; i < startOffset; i++) allCells.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
        allCells.push(new Date(year, month, d));
    }
    const weeks = [];
    for (let i = 0; i < allCells.length; i += 7) {
        weeks.push(allCells.slice(i, i + 7));
    }
    weeks.forEach(week => {
        const tr = document.createElement("tr");
        week.forEach(date => {
            const td = document.createElement("td");
            if (!date) {
                td.className = "empty-cell";
                tr.appendChild(td);
                return;
            }
            const key = dateKey(date);
            const reward = starsForDay(date);
            const dateOnly = new Date(date);
            dateOnly.setHours(0, 0, 0, 0);
            const isToday = dateOnly.getTime() === today.getTime();
            const isPast = dateOnly < today;
            const isFuture = dateOnly > today;
            const num = document.createElement("div");
            num.className = "day-num-cell";
            num.textContent = date.getDate();
            td.appendChild(num);
            const content = document.createElement("div");
            content.className = "day-content";
            const badge = document.createElement("span");
            const rewardEl = document.createElement("div");
            rewardEl.className = "day-reward";
            if (claimed[key]) {
                badge.className = "status-badge claimed";
                badge.textContent = "Забрано";
                rewardEl.innerHTML = `+${reward} <span class="star-icon">⭐</span>`;
                monthTotal += claimed[key];
                td.classList.add("claimed-cell");
                if (isToday) td.classList.add("claimed-today");
            } else if (isToday) {
                badge.className = "status-badge available";
                badge.textContent = "Забрать";
                rewardEl.innerHTML = `+${reward} <span class="star-icon">⭐</span>`;
                td.classList.add("today-cell");
                td.addEventListener("click", () => claimDay(key, reward));
            } else if (isPast) {
                badge.className = "status-badge missed";
                badge.textContent = "Не забрано";
                rewardEl.innerHTML = `+${reward} <span class="star-icon">⭐</span>`;
                td.classList.add("missed-cell");
            } else if (isFuture) {
                badge.className = "status-badge available";
                badge.textContent = "Доступно";
                rewardEl.innerHTML = `+${reward} <span class="star-icon">⭐</span>`;
                td.classList.add("future-cell");
            }
            content.appendChild(badge);
            content.appendChild(rewardEl);
            td.appendChild(content);
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    const balanceEl = document.querySelector("#rewardsBalance");
    const monthEl = document.querySelector("#rewardsMonthTotal");
    const streakEl = document.querySelector("#rewardsStreak");
    if (balanceEl) balanceEl.textContent = getStars();
    if (monthEl) monthEl.textContent = monthTotal;
    if (streakEl) streakEl.textContent = countStreak();
}

function claimDay(key, reward) {
    const claimed = getClaimed();
    if (claimed[key]) return;
    claimed[key] = reward;
    saveClaimed(claimed);
    const newTotal = getStars() + reward;
    saveStarsToCloud(newTotal);
    showToast(`⭐ +${reward} звёзд! Баланс: ${newTotal}`);
    renderRewards();
}

document.querySelector("#calendarBtn")?.addEventListener("click", () => {
    switchTab("rewards");
    renderRewards();
});

updateStarsBalance();

/* ================= АДМИН-ПАНЕЛЬ ================= */

const GIFTS_KEY = "vc_admin_gifts";
const TAKES_KEY = "vc_admin_takes";

function getGifts() {
    return JSON.parse(localStorage.getItem(GIFTS_KEY) || "[]");
}
function saveGifts(gifts) {
    localStorage.setItem(GIFTS_KEY, JSON.stringify(gifts));
}
function getTakes() {
    return JSON.parse(localStorage.getItem(TAKES_KEY) || "[]");
}
function saveTakes(takes) {
    localStorage.setItem(TAKES_KEY, JSON.stringify(takes));
}

function updateAdminPanel() {
    const panel = document.querySelector("#adminPanel");
    if (!panel) return;
    const user = currentUser();
    if (user && isAdminUser(user.email)) {
        panel.classList.remove("hidden");
    } else {
        panel.classList.add("hidden");
    }
}

document.querySelector("#adminGiveStars")?.addEventListener("click", async () => {
    const user = currentUser();
    if (!user || !isAdminUser(user.email)) return;

    const emailInput = document.querySelector("#adminEmail");
    const amountInput = document.querySelector("#adminAmount");

    const email = emailInput.value.trim().toLowerCase();
    const amount = parseInt(amountInput.value);

    if (!email || !email.includes("@") || email.length < 5) {
        showToast("❌ Введите корректный email");
        return;
    }
    if (!amount || amount < 1) {
        showToast("❌ Введите количество (от 1)");
        return;
    }

    if (user.email.toLowerCase() === email) {
        const newTotal = getStars() + amount;
        await saveStarsToCloud(newTotal);
        if (typeof renderRewards === "function") renderRewards();
        showToast(`👑 +${amount} ⭐ начислено вам!`);
    } else {
        if (window.firebaseDB) {
            try {
                const { db, doc, getDoc, setDoc } = window.firebaseDB;
                const ref = doc(db, "users", email);
                const snap = await getDoc(ref);
                if (!snap.exists()) {
                    showToast("❌ Пользователь не найден");
                    return;
                }
                const current = snap.data().stars || 0;
                await setDoc(ref, { stars: current + amount }, { merge: true });
                showToast(`✅ +${amount} ⭐ начислено`);
            } catch (e) {
                showToast("❌ Ошибка: " + e.message);
            }
        }
    }
    emailInput.value = "";
    amountInput.value = "";
});

document.querySelector("#adminTakeStars")?.addEventListener("click", async () => {
    const user = currentUser();
    if (!user || !isAdminUser(user.email)) return;

    const emailInput = document.querySelector("#adminTakeEmail");
    const amountInput = document.querySelector("#adminTakeAmount");

    const email = emailInput.value.trim().toLowerCase();
    const amount = parseInt(amountInput.value);

    if (!email || !email.includes("@") || email.length < 5) {
        showToast("❌ Введите корректный email");
        return;
    }
    if (!amount || amount < 1) {
        showToast("❌ Введите количество (от 1)");
        return;
    }

    if (user.email.toLowerCase() === email) {
        const newTotal = Math.max(0, getStars() - amount);
        await saveStarsToCloud(newTotal);
        if (typeof renderRewards === "function") renderRewards();
        showToast(`💀 -${amount} ⭐ списано`);
    } else {
        if (window.firebaseDB) {
            try {
                const { db, doc, getDoc, setDoc } = window.firebaseDB;
                const ref = doc(db, "users", email);
                const snap = await getDoc(ref);
                if (!snap.exists()) {
                    showToast("❌ Пользователь не найден");
                    return;
                }
                const current = snap.data().stars || 0;
                await setDoc(ref, { stars: Math.max(0, current - amount) }, { merge: true });
                showToast(`💀 -${amount} ⭐`);
            } catch (e) {
                showToast("❌ Ошибка: " + e.message);
            }
        }
    }
    emailInput.value = "";
    amountInput.value = "";
});

document.querySelectorAll("[data-quick-give]").forEach(btn => {
    btn.addEventListener("click", () => {
        const amountInput = document.querySelector("#adminAmount");
        if (amountInput) {
            amountInput.value = btn.dataset.quickGive;
            amountInput.focus();
        }
    });
});

function checkMyGifts() {
    const user = currentUser();
    if (!user) return;
    const myEmail = user.email.toLowerCase();
    let hasChanges = false;
    let message = "";

    const gifts = getGifts();
    const myGifts = gifts.filter(g => g.email === myEmail);
    if (myGifts.length) {
        let total = 0;
        myGifts.forEach(g => total += g.amount);
        const current = parseInt(localStorage.getItem("vc_stars") || "0");
        localStorage.setItem("vc_stars", String(current + total));
        saveGifts(gifts.filter(g => g.email !== myEmail));
        hasChanges = true;
        message += `🎁 +${total} ⭐ `;
    }

    const takes = getTakes();
    const myTakes = takes.filter(t => t.email === myEmail);
    if (myTakes.length) {
        let total = 0;
        myTakes.forEach(t => total += t.amount);
        const current = parseInt(localStorage.getItem("vc_stars") || "0");
        localStorage.setItem("vc_stars", String(Math.max(0, current - total)));
        saveTakes(takes.filter(t => t.email !== myEmail));
        hasChanges = true;
        message += `💀 -${total} ⭐ `;
    }

    if (hasChanges) {
        updateStarsBalance();
        if (typeof renderRewards === "function") renderRewards();
        setTimeout(() => showToast(message), 800);
    }
}

const _origRenderProfile = renderProfile;
window.renderProfile = function () {
    _origRenderProfile();
    updateAdminPanel();
};

window.addEventListener("load", () => {
    setTimeout(checkMyGifts, 1500);
});

async function initAuthListener() {
    while (!window.firebaseAuth || !window.firebaseDB) {
        await new Promise(r => setTimeout(r, 100));
    }
    window.firebaseAuth.onAuthStateChanged(window.firebaseAuth.auth, async (user) => {
        if (user) {
            localStorage.setItem("vc_user_email", user.email);
            let name = user.displayName || localStorage.getItem("vc_user_name");
            if (!name || name === "Пользователь") {
                name = localStorage.getItem("vc_user_name") || "Пользователь";
            }
            localStorage.setItem("vc_user_name", name);

            if (window.firebaseDB) {
                try {
                    const { db, doc, getDoc } = window.firebaseDB;
                    const ref = doc(db, "users", user.email);
                    const snap = await getDoc(ref);
                    if (snap.exists() && snap.data().nick) {
                        localStorage.setItem("vc_user_nick", snap.data().nick);
                    }
                } catch (e) {
                    console.error("Ошибка загрузки ника:", e);
                }
            }

            await loadStarsFromCloud();
            if (typeof loadFramesFromCloud === "function") {
                await loadFramesFromCloud();
            }
            if (typeof loadAvatarsFromCloud === "function") {
                await loadAvatarsFromCloud();
            }
            await loadAchievementsFromCloud();
            const tempUser = currentUser();
            if (tempUser && isSuperUser(tempUser.email)) {
                const allIds = ACHIEVEMENTS.map(a => a.id);
                let changed = false;
                allIds.forEach(id => {
                    if (!tempUser.achievements.includes(id)) {
                        tempUser.achievements.push(id);
                        changed = true;
                    }
                });
                if (changed) {
                    saveCurrentUser(tempUser);
                    saveAchievementsToCloud(tempUser.achievements);
                }
            }
        } else {
            localStorage.removeItem("vc_user_email");
        }
        renderProfile();
    });
}

initAuthListener();

async function initGiftWatcher() {
    while (!window.firebaseAuth) {
        await new Promise(r => setTimeout(r, 100));
    }
    window.firebaseAuth.onAuthStateChanged(window.firebaseAuth.auth, () => {
        setTimeout(checkMyGifts, 500);
    });
}
initGiftWatcher();

/* ================= МАГАЗИН ================= */

const SHOP_FRAMES = [
    { id: "none", name: "❌ Снять рамку", price: 0, emoji: "🚫" },
    { id: "bronze", name: "🥉 Бронзовая", price: 100, emoji: "👨‍🍳" },
    { id: "silver", name: "🥈 Серебряная", price: 300, emoji: "👨‍🍳" },
    { id: "gold", name: "🥇 Золотая", price: 500, emoji: "👨‍🍳" },
    { id: "diamond", name: "💎 Алмазная", price: 1000, emoji: "👨‍🍳" },
    { id: "rainbow", name: "🌈 Радужная", price: 5000, emoji: "👨‍🍳" },
    { id: "admin", name: "🔥 Адская", price: 0, emoji: "👑" },
    { id: "zombie", name: "🧟 Зомби", price: 0, emoji: "🧟" }
];

const SHOP_AVATARS = [
    { id: "none", name: "❌ Убрать аватарку", price: 0, emoji: "🚫" },
    { id: "zombie", name: "🧟 Зомби", price: 0, emoji: "🧟" }
];

const SHOP_SECTIONS = {
    frames: { icon: "🎨", title: "Рамки" },
    avatars: { icon: "😎", title: "Аватарки" },
    badges: { icon: "🏅", title: "Значки" },
    boosts: { icon: "⚡", title: "Бусты" }
};

document.querySelector("#shopBtn")?.addEventListener("click", () => {
    switchTab("shop");
    updateShopBalance();
    renderShopSection("frames");
});

function updateShopBalance() {
    const el = document.querySelector("#shopBalance");
    if (el) el.textContent = getStars();
}

async function loadFramesFromCloud() {
    if (!window.firebaseDB) return;
    const user = currentUser();
    if (!user) return;
    try {
        const { db, doc, getDoc } = window.firebaseDB;
        const ref = doc(db, "users", user.email);
        const snap = await getDoc(ref);
        if (snap.exists()) {
            const data = snap.data();
            userFrames.owned = data.ownedFrames || [];
            userFrames.active = data.activeFrame || null;
            applyActiveFrame();
        }
    } catch (e) {
        console.error("Ошибка загрузки рамок:", e);
    }
}

async function loadAvatarsFromCloud() {
    if (!window.firebaseDB) return;
    const user = currentUser();
    if (!user) return;
    try {
        const { db, doc, getDoc } = window.firebaseDB;
        const ref = doc(db, "users", user.email);
        const snap = await getDoc(ref);
        if (snap.exists()) {
            const data = snap.data();
            userAvatars.owned = data.ownedAvatars || [];
            userAvatars.active = data.activeAvatar || null;
            applyActiveAvatar();
        }
    } catch (e) {
        console.error("Ошибка загрузки аватарок:", e);
    }
}

async function saveFramesToCloud() {
    if (!window.firebaseDB) return;
    const user = currentUser();
    if (!user) return;
    try {
        const { db, doc, setDoc } = window.firebaseDB;
        const ref = doc(db, "users", user.email);
        await setDoc(ref, {
            ownedFrames: userFrames.owned,
            activeFrame: userFrames.active
        }, { merge: true });
    } catch (e) {
        console.error("Ошибка сохранения рамок:", e);
    }
}

async function saveAvatarsToCloud() {
    if (!window.firebaseDB) return;
    const user = currentUser();
    if (!user) return;
    try {
        const { db, doc, setDoc } = window.firebaseDB;
        const ref = doc(db, "users", user.email);
        await setDoc(ref, {
            ownedAvatars: userAvatars.owned,
            activeAvatar: userAvatars.active
        }, { merge: true });
    } catch (e) {
        console.error("Ошибка сохранения аватарок:", e);
    }
}

function applyActiveFrame() {
    const avatar = document.querySelector("#profileAvatar");
    if (!avatar) return;
    avatar.className = "profile-avatar";
    if (userFrames.active) {
        avatar.classList.add("frame-" + userFrames.active);
    }
}

function applyActiveAvatar() {
    const avatar = document.querySelector("#profileAvatar");
    if (!avatar) return;
    const user = currentUser();
    const letter = user ? user.name[0].toUpperCase() : "?";
    avatar.setAttribute("data-letter", letter);

    avatar.innerHTML = "";

    if (userAvatars.active) {
        avatar.innerHTML = `<img src="images/avatar-${userAvatars.active}.png" alt="avatar">`;
    } else {
        avatar.innerHTML = `<span style="position:relative;z-index:5;color:#fff;font-size:44px;font-weight:700;text-shadow:0 2px 6px rgba(0,0,0,.5);">${letter}</span>`;
    }
}

function renderShopSection(sectionKey) {
    const content = document.querySelector("#shopContent");
    const grid = document.querySelector("#shopGrid");
    if (!content || !grid) return;
    if (sectionKey === "frames") {
        content.classList.add("hidden");
        grid.classList.remove("hidden");
        renderFramesGrid();
    } else if (sectionKey === "avatars") {
        content.classList.add("hidden");
        grid.classList.remove("hidden");
        renderAvatarsGrid();
    } else {
        content.classList.remove("hidden");
        grid.classList.add("hidden");
        const section = SHOP_SECTIONS[sectionKey];
        content.innerHTML = `
            <div class="shop-empty">
                <div class="shop-empty-icon">${section.icon}</div>
                <h2>Раздел «${section.title}»</h2>
                <p>Товары скоро появятся!</p>
            </div>
        `;
    }
}

function renderFramesGrid() {
    const grid = document.querySelector("#shopGrid");
    if (!grid) return;
    const stars = getStars();
    const user = currentUser();

    const visibleFrames = SHOP_FRAMES.filter(frame => {
        if (frame.id === "admin" && !isAdminFrameUser(user?.email)) return false;
        if (frame.id === "zombie" && !isZombieUser(user?.email)) return false;
        return true;
    });

    grid.innerHTML = visibleFrames.map(frame => {
        const isOwned = userFrames.owned.includes(frame.id);
        const isActive = userFrames.active === frame.id;
        const isNone = frame.id === "none";
        const canAfford = stars >= frame.price;
        let btnText = "Купить";
        let btnClass = "";
        let disabled = "";

        if (isNone) {
            btnText = isActive ? "✓ Активна" : "Снять";
            btnClass = isActive ? "active-frame" : "";
            disabled = isActive ? "disabled" : "";
        } else if (isActive) {
            btnText = "✓ Активна";
            btnClass = "active-frame";
            disabled = "disabled";
        } else if (isOwned) {
            btnText = "Применить";
            btnClass = "owned";
        } else if (!canAfford) {
            btnText = "Не хватает ⭐";
            disabled = "disabled";
        }

        return `
            <div class="shop-card">
                <div class="shop-frame-preview ${isNone ? '' : frame.id}">${frame.emoji}</div>
                <h3>${frame.name}</h3>
                <div class="shop-price">${frame.price} ⭐</div>
                <button
                    data-frame="${frame.id}"
                    data-action="${isActive ? 'none' : (isOwned || isNone) ? 'apply' : 'buy'}"
                    class="${btnClass}"
                    ${disabled}
                >${btnText}</button>
            </div>
        `;
    }).join("");
}

function renderAvatarsGrid() {
    const grid = document.querySelector("#shopGrid");
    if (!grid) return;
    const stars = getStars();
    const user = currentUser();

    const visibleAvatars = SHOP_AVATARS.filter(avatar => {
        if (avatar.id === "zombie" && !isZombieUser(user?.email)) return false;
        return true;
    });

    grid.innerHTML = visibleAvatars.map(avatar => {
        const isOwned = userAvatars.owned.includes(avatar.id);
        const isActive = userAvatars.active === avatar.id;
        const isNone = avatar.id === "none";
        const canAfford = stars >= avatar.price;
        let btnText = "Купить";
        let btnClass = "";
        let disabled = "";

        if (isNone) {
            btnText = isActive ? "✓ Активна" : "Убрать";
            btnClass = isActive ? "active-frame" : "";
            disabled = isActive ? "disabled" : "";
        } else if (isActive) {
            btnText = "✓ Активна";
            btnClass = "active-frame";
            disabled = "disabled";
        } else if (isOwned) {
            btnText = "Применить";
            btnClass = "owned";
        } else if (!canAfford) {
            btnText = "Не хватает ⭐";
            disabled = "disabled";
        }

        return `
            <div class="shop-card">
                <div class="shop-frame-preview ${isNone ? '' : 'zombie'}">${avatar.emoji}</div>
                <h3>${avatar.name}</h3>
                <div class="shop-price">${avatar.price} ⭐</div>
                <button
                    data-avatar="${avatar.id}"
                    data-action="${isActive ? 'none' : (isOwned || isNone) ? 'apply' : 'buy'}"
                    class="${btnClass}"
                    ${disabled}
                >${btnText}</button>
            </div>
        `;
    }).join("");
}

document.querySelector("#shopGrid")?.addEventListener("click", async (e) => {
    const frameBtn = e.target.closest("button[data-frame]");
    if (frameBtn && !frameBtn.disabled) {
        const frameId = frameBtn.dataset.frame;
        const action = frameBtn.dataset.action;
        const frame = SHOP_FRAMES.find(f => f.id === frameId);
        if (!frame) return;

        const user = currentUser();
        if (frameId === "admin" && !isAdminFrameUser(user?.email)) {
            showToast("❌ Эта рамка только для админов");
            return;
        }
        if (frameId === "zombie" && !isZombieUser(user?.email)) {
            showToast("❌ Эта рамка только для избранных");
            return;
        }

        if (frameId === "none") {
            userFrames.active = null;
            await saveFramesToCloud();
            renderFramesGrid();
            applyActiveFrame();
            applyActiveAvatar();
            showToast("✨ Рамка снята");
            return;
        }

        if (action === "buy") {
            const stars = getStars();
            if (stars < frame.price) {
                showToast("❌ Недостаточно звёзд");
                return;
            }
            const newBalance = stars - frame.price;
            await saveStarsToCloud(newBalance);
            userFrames.owned.push(frameId);
            userFrames.active = frameId;
            await saveFramesToCloud();
            updateShopBalance();
            renderFramesGrid();
            applyActiveFrame();
            applyActiveAvatar();
            showToast(`✅ Куплено: ${frame.name}!`);
            checkAchievements();
        } else if (action === "apply") {
            userFrames.active = frameId;
            await saveFramesToCloud();
            renderFramesGrid();
            applyActiveFrame();
            applyActiveAvatar();
            showToast(`✨ Применено: ${frame.name}`);
        }
        return;
    }

    const avatarBtn = e.target.closest("button[data-avatar]");
    if (avatarBtn && !avatarBtn.disabled) {
        const avatarId = avatarBtn.dataset.avatar;
        const action = avatarBtn.dataset.action;
        const avatar = SHOP_AVATARS.find(a => a.id === avatarId);
        if (!avatar) return;

        const user = currentUser();
        if (avatarId === "zombie" && !isZombieUser(user?.email)) {
            showToast("❌ Эта аватарка только для избранных");
            return;
        }

        if (avatarId === "none") {
            userAvatars.active = null;
            await saveAvatarsToCloud();
            renderAvatarsGrid();
            applyActiveAvatar();
            applyActiveFrame();
            showToast("✨ Аватарка убрана");
            return;
        }

        if (action === "buy") {
            const stars = getStars();
            if (stars < avatar.price) {
                showToast("❌ Недостаточно звёзд");
                return;
            }
            const newBalance = stars - avatar.price;
            await saveStarsToCloud(newBalance);
            userAvatars.owned.push(avatarId);
            userAvatars.active = avatarId;
            await saveAvatarsToCloud();
            updateShopBalance();
            renderAvatarsGrid();
            applyActiveAvatar();
            applyActiveFrame();
            showToast(`✅ Куплено: ${avatar.name}!`);
        } else if (action === "apply") {
            userAvatars.active = avatarId;
            await saveAvatarsToCloud();
            renderAvatarsGrid();
            applyActiveAvatar();
            applyActiveFrame();
            showToast(`✨ Применено: ${avatar.name}`);
        }
    }
});

document.querySelector("#shopTabs")?.addEventListener("click", (e) => {
    const tab = e.target.closest(".shop-tab");
    if (!tab) return;
    document.querySelectorAll(".shop-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    renderShopSection(tab.dataset.shop);
});

window.loadFramesFromCloud = loadFramesFromCloud;
window.loadAvatarsFromCloud = loadAvatarsFromCloud;
window.applyActiveFrame = applyActiveFrame;
window.applyActiveAvatar = applyActiveAvatar;

/* ================= РЕЖИМ ГОТОВКИ ================= */

let currentCookingRecipe = null;
let currentCookingStep = 0;

function getCookedRecipes() {
    return JSON.parse(localStorage.getItem("vc_cooked_recipes") || "[]");
}

function getRecipeCookCount(recipeId) {
    const counts = JSON.parse(localStorage.getItem("vc_cooked_counts") || "{}");
    return counts[recipeId] || 0;
}

function markRecipeCooked(recipeId) {
    const cooked = getCookedRecipes();
    if (!cooked.includes(recipeId)) {
        cooked.push(recipeId);
        localStorage.setItem("vc_cooked_recipes", JSON.stringify(cooked));
    }
    const counts = JSON.parse(localStorage.getItem("vc_cooked_counts") || "{}");
    counts[recipeId] = (counts[recipeId] || 0) + 1;
    localStorage.setItem("vc_cooked_counts", JSON.stringify(counts));
    return counts[recipeId];
}

function getRecipeReward(cookCount) {
    const rewards = [30, 20, 10, 5, 2, 1];
    if (cookCount <= rewards.length) return rewards[cookCount - 1];
    return 0;
}

function openCookingMode(recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe || !recipe.steps || !recipe.steps.length) {
        showToast("❌ У этого рецепта нет шагов");
        return;
    }
    currentCookingRecipe = recipe;
    currentCookingStep = 0;
    switchTab("cooking");
    renderCookingStep();
}

function renderCookingStep() {
    if (!currentCookingRecipe) return;
    const r = currentCookingRecipe;
    const total = r.steps.length;
    const step = currentCookingStep;

    document.querySelector("#cookingRecipeName").textContent = "🍳 " + r.name;
    document.querySelector("#cookingStepNum").textContent = step + 1;
    document.querySelector("#cookingStepTotal").textContent = total;

    const content = document.querySelector("#cookingStepContent");
    content.classList.add("animating");
    setTimeout(() => {
        content.textContent = r.steps[step];
        content.classList.remove("animating");
    }, 150);

    const dots = document.querySelector("#cookingDots");
    dots.innerHTML = r.steps.map((_, i) => {
        let cls = "cooking-dot";
        if (i === step) cls += " active";
        else if (i < step) cls += " done";
        return `<button class="${cls}" data-step="${i}"></button>`;
    }).join("");

    const prevBtn = document.querySelector("#cookingPrev");
    const nextBtn = document.querySelector("#cookingNext");
    const finishBtn = document.querySelector("#cookingFinish");

    prevBtn.disabled = step === 0;

    if (step === total - 1) {
        nextBtn.classList.add("hidden");
        finishBtn.classList.remove("hidden");
    } else {
        nextBtn.classList.remove("hidden");
        finishBtn.classList.add("hidden");
    }
}

function restoreCookingPage() {
    const cookingBody = document.querySelector(".cooking-body");
    cookingBody.innerHTML = `
        <div class="cooking-step-badge">
            Шаг <span id="cookingStepNum">1</span> из <span id="cookingStepTotal">5</span>
        </div>
        <div class="cooking-step-content" id="cookingStepContent">Текст шага</div>
        <div class="cooking-dots" id="cookingDots"></div>
        <div class="cooking-nav">
            <button class="cooking-btn cooking-btn-prev" id="cookingPrev" disabled>← Назад</button>
            <button class="cooking-btn cooking-btn-next" id="cookingNext">Дальше →</button>
            <button class="cooking-btn cooking-btn-finish hidden" id="cookingFinish">✅ Готово!</button>
        </div>
    `;
    attachCookingHandlers();
}

function attachCookingHandlers() {
    document.querySelector("#cookingPrev")?.addEventListener("click", () => {
        if (currentCookingStep > 0) {
            currentCookingStep--;
            renderCookingStep();
        }
    });

    document.querySelector("#cookingNext")?.addEventListener("click", () => {
        if (currentCookingRecipe && currentCookingStep < currentCookingRecipe.steps.length - 1) {
            currentCookingStep++;
            renderCookingStep();
        }
    });

    document.querySelector("#cookingDots")?.addEventListener("click", (e) => {
        const dot = e.target.closest(".cooking-dot");
        if (!dot) return;
        currentCookingStep = +dot.dataset.step;
        renderCookingStep();
    });

    document.querySelector("#cookingFinish")?.addEventListener("click", async () => {
        if (!currentCookingRecipe) return;
        const user = currentUser();
        if (!user) {
            showToast("❌ Войдите, чтобы получить награду");
            switchTab("home");
            return;
        }

        const cookCount = markRecipeCooked(currentCookingRecipe.id);
        const reward = getRecipeReward(cookCount);

        if (reward > 0) {
            const newTotal = getStars() + reward;
            await saveStarsToCloud(newTotal);
        }

        checkAchievements();

        let subText = "";
        if (cookCount === 1) {
            subText = "🎉 Первое приготовление — максимальный бонус!";
        } else if (reward > 0) {
            subText = `Вы готовили это блюдо ${cookCount} раз(а)`;
        } else {
            subText = `Вы готовили это блюдо ${cookCount} раз(а) — награда больше не начисляется`;
        }

        const cookingBody = document.querySelector(".cooking-body");
        cookingBody.innerHTML = `
            <div class="cooking-win">
                <div class="cooking-win-icon">🎉</div>
                <h1>${cookCount === 1 ? "Поздравляем!" : "Отлично!"}</h1>
                <p>Вы приготовили <b>${currentCookingRecipe.name}</b></p>
                <div class="cooking-win-stars">⭐ +${reward} звёзд</div>
                <p style="font-size:14px;color:#999;">${subText}</p>
                <div class="cooking-win-buttons">
                    <button class="cooking-btn cooking-btn-next" id="backToHome">🏠 На главную</button>
                    <button class="cooking-btn cooking-btn-prev" id="backToRecipes">🕮 Другие рецепты</button>
                </div>
            </div>
        `;
        document.querySelector("#backToHome")?.addEventListener("click", () => {
            restoreCookingPage();
            switchTab("home");
        });
        document.querySelector("#backToRecipes")?.addEventListener("click", () => {
            restoreCookingPage();
            switchTab("recipes");
        });
    });
}

attachCookingHandlers();

document.querySelector("#cookingBack")?.addEventListener("click", () => {
    switchTab("home");
    if (currentCookingRecipe) {
        setTimeout(() => openRecipe(currentCookingRecipe.id), 300);
    }
});

let touchStartX = 0;
document.addEventListener("touchstart", e => {
    if (!document.querySelector("#page-cooking").classList.contains("active")) return;
    touchStartX = e.touches[0].clientX;
}, { passive: true });

document.addEventListener("touchend", e => {
    if (!document.querySelector("#page-cooking").classList.contains("active")) return;
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) < 50) return;

    if (delta > 0 && currentCookingStep > 0) {
        currentCookingStep--;
        renderCookingStep();
    } else if (delta < 0 && currentCookingRecipe && currentCookingStep < currentCookingRecipe.steps.length - 1) {
        currentCookingStep++;
        renderCookingStep();
    }
}, { passive: true });

/* ================= ДРУЗЬЯ ================= */

async function getUserData(email) {
    if (!window.firebaseDB) return null;
    try {
        const { db, doc, getDoc } = window.firebaseDB;
        const ref = doc(db, "users", email);
        const snap = await getDoc(ref);
        return snap.exists() ? snap.data() : null;
    } catch (e) {
        console.error("Ошибка загрузки:", e);
        return null;
    }
}

async function getIncomingRequests() {
    const user = currentUser();
    if (!user) return [];
    if (!window.firebaseDB) return [];

    try {
        const { db, collection, query, where, getDocs } = window.firebaseDB;
        const q = query(
            collection(db, "friendRequests"),
            where("to", "==", user.email),
            where("status", "==", "pending")
        );
        const snap = await getDocs(q);
        const requests = [];
        snap.forEach(d => requests.push({ id: d.id, ...d.data() }));
        return requests;
    } catch (e) {
        console.error("Ошибка загрузки заявок:", e);
        return [];
    }
}

async function updateFriendsBadge() {
    const requests = await getIncomingRequests();
    const badge = document.querySelector("#friendsBadge");
    const count = document.querySelector("#requestsCount");

    if (badge) {
        if (requests.length > 0) {
            badge.textContent = requests.length;
            badge.classList.remove("hidden");
        } else {
            badge.classList.add("hidden");
        }
    }

    if (count) count.textContent = `(${requests.length})`;
}

async function showFriendsNotification() {
    const user = currentUser();
    if (!user) return;
    const requests = await getIncomingRequests();
    if (requests.length > 0) {
        setTimeout(() => {
            showToast(`📨 У вас ${requests.length} заявок в друзья!`);
        }, 2000);
    }
}

async function searchUserByNick(nick) {
    if (!window.firebaseDB) return null;
    try {
        const { db, doc, getDoc } = window.firebaseDB;
        const nickRef = doc(db, "nicks", nick.toLowerCase());
        const nickSnap = await getDoc(nickRef);
        if (!nickSnap.exists()) return null;

        const email = nickSnap.data().email;
        const userRef = doc(db, "users", email);
        const userSnap = await getDoc(userRef);
        return userSnap.exists() ? { email: userSnap.id, ...userSnap.data() } : null;
    } catch (e) {
        console.error("Ошибка поиска:", e);
        return null;
    }
}

async function renderSearchResult(foundUser) {
    const container = document.querySelector("#friendsSearchResult");
    if (!container) return;

    const me = currentUser();
    if (!me) {
        container.innerHTML = `<div class="friends-empty">Войдите, чтобы добавлять друзей</div>`;
        return;
    }

    if (!foundUser) {
        container.innerHTML = `<div class="friends-empty">❌ Пользователь не найден</div>`;
        return;
    }

    if (foundUser.email === me.email) {
        container.innerHTML = `<div class="friends-empty">Это вы 😄</div>`;
        return;
    }

    const meData = await getUserData(me.email);
    const isFriend = meData?.friends?.includes(foundUser.email);

    const requests = await getIncomingRequests();
    const hasIncoming = requests.some(r => r.from === foundUser.email);

    let btnHTML = "";
    if (isFriend) {
        btnHTML = `<button class="friend-already-btn" disabled>✓ Уже друг</button>`;
    } else if (hasIncoming) {
        btnHTML = `<button class="friend-pending-btn" disabled>📨 Вам отправил заявку</button>`;
    } else {
        btnHTML = `<button class="friend-add-btn" data-add-friend="${foundUser.email}">➕ Добавить</button>`;
    }

    container.innerHTML = `
        <div class="friend-result-card">
            <div class="avatar">${(foundUser.name || "?")[0].toUpperCase()}</div>
            <div class="info">
                <b>${foundUser.name || "Без имени"}</b>
                <small>@${foundUser.nick || "без_ника"}</small>
            </div>
            ${btnHTML}
        </div>
    `;
}

async function sendFriendRequest(toEmail) {
    const me = currentUser();
    if (!me || !window.firebaseDB) return;

    try {
        const { db, collection, addDoc } = window.firebaseDB;
        await addDoc(collection(db, "friendRequests"), {
            from: me.email,
            fromName: me.name,
            fromNick: me.nick || "",
            to: toEmail,
            status: "pending",
            date: Date.now()
        });
        showToast("📨 Заявка отправлена!");
        document.querySelector("#friendsSearchResult").innerHTML = "";
    } catch (e) {
        console.error("Ошибка отправки заявки:", e);
        showToast("❌ Ошибка отправки");
    }
}

async function renderRequests() {
    const container = document.querySelector("#requestsList");
    if (!container) return;

    const requests = await getIncomingRequests();

    if (!requests.length) {
        container.innerHTML = `<div class="friends-empty">Пока нет заявок</div>`;
        return;
    }

    container.innerHTML = requests.map(r => `
        <div class="friend-row">
            <div class="avatar">${(r.fromName || "?")[0].toUpperCase()}</div>
            <div class="info">
                <b>${r.fromName || "Без имени"}</b>
                <small>@${r.fromNick || "без_ника"}</small>
            </div>
            <div class="actions">
                <button class="btn-accept" data-accept="${r.id}" data-from="${r.from}" data-fromname="${r.fromName || 'Друг'}">✅ Принять</button>
                <button class="btn-reject" data-reject="${r.id}">❌ Отклонить</button>
            </div>
        </div>
    `).join("");
}

async function acceptRequest(requestId, fromEmail, fromName) {
    const me = currentUser();
    if (!me || !window.firebaseDB) return;

    try {
        const { db, doc, getDoc, setDoc, deleteDoc, arrayUnion } = window.firebaseDB;

        const myRef = doc(db, "users", me.email);
        const mySnap = await getDoc(myRef);
        const myFriends = mySnap.data().friends || [];
        if (!myFriends.includes(fromEmail)) {
            await setDoc(myRef, { friends: arrayUnion(fromEmail) }, { merge: true });
        }

        const hisRef = doc(db, "users", fromEmail);
        const hisSnap = await getDoc(hisRef);
        const hisFriends = hisSnap.data().friends || [];
        if (!hisFriends.includes(me.email)) {
            await setDoc(hisRef, { friends: arrayUnion(me.email) }, { merge: true });
        }

        await deleteDoc(doc(db, "friendRequests", requestId));

        showToast(`🤝 Теперь вы друзья с ${fromName}!`);
        renderRequests();
        updateFriendsBadge();
        renderFriends();
        renderProfile();
    } catch (e) {
        console.error("Ошибка принятия:", e);
        showToast("❌ Ошибка");
    }
}

async function rejectRequest(requestId) {
    if (!window.firebaseDB) return;
    try {
        const { db, doc, deleteDoc } = window.firebaseDB;
        await deleteDoc(doc(db, "friendRequests", requestId));
        showToast("❌ Заявка отклонена");
        renderRequests();
        updateFriendsBadge();
    } catch (e) {
        console.error("Ошибка отклонения:", e);
    }
}

async function renderFriends() {
    const container = document.querySelector("#friendsList");
    const countEl = document.querySelector("#friendsCount");
    if (!container) return;

    const me = currentUser();
    if (!me) {
        container.innerHTML = `<div class="friends-empty">Войдите, чтобы увидеть друзей</div>`;
        if (countEl) countEl.textContent = "(0)";
        return;
    }

    const meData = await getUserData(me.email);
    const friends = meData?.friends || [];

    if (countEl) countEl.textContent = `(${friends.length})`;

    localStorage.setItem("vc_friends_count", String(friends.length));
    checkAchievements();

    if (!friends.length) {
        container.innerHTML = `<div class="friends-empty">У вас пока нет друзей</div>`;
        return;
    }

    const friendsData = await Promise.all(friends.map(email => getUserData(email)));

    container.innerHTML = friendsData.map((f, i) => {
        if (!f) return "";
        return `
            <div class="friend-row">
                <div class="avatar">${(f.name || "?")[0].toUpperCase()}</div>
                <div class="info">
                    <b>${f.name || "Без имени"}</b>
                    <small>@${f.nick || "без_ника"} · ⭐ ${f.stars || 0} · 🏆 ${f.achievements?.length || 0}</small>
                </div>
                <div class="actions">
                    <button class="btn-profile" data-view-friend="${friends[i]}">👤 Профиль</button>
                    <button class="btn-gift" data-gift="${friends[i]}">⭐ Подарить</button>
                    <button class="btn-remove" data-remove-friend="${friends[i]}">🗑</button>
                </div>
            </div>
        `;
    }).join("");
}

async function showFriendProfile(email) {
    const friend = await getUserData(email);
    if (!friend) {
        showToast("❌ Пользователь не найден");
        return;
    }
    await openFriendPage(friend);
}

async function removeFriend(email) {
    const me = currentUser();
    if (!me || !window.firebaseDB) return;

    if (!confirm("Удалить из друзей?")) return;

    try {
        const { db, doc, setDoc, arrayRemove } = window.firebaseDB;

        await setDoc(doc(db, "users", me.email), {
            friends: arrayRemove(email)
        }, { merge: true });

        await setDoc(doc(db, "users", email), {
            friends: arrayRemove(me.email)
        }, { merge: true });

        showToast("🗑 Удалено из друзей");
        renderFriends();
        renderProfile();
    } catch (e) {
        console.error("Ошибка удаления:", e);
    }
}

async function giveStarsToFriend(email, amount) {
    const me = currentUser();
    if (!me || !window.firebaseDB) return;

    const amountNum = parseInt(amount);
    if (!amountNum || amountNum < 1) {
        showToast("❌ Введи число больше 0");
        return;
    }

    if (getStars() < amountNum) {
        showToast("❌ Недостаточно звёзд");
        return;
    }

    try {
        const { db, doc, getDoc, setDoc } = window.firebaseDB;

        await saveStarsToCloud(getStars() - amountNum);

        const hisRef = doc(db, "users", email);
        const hisSnap = await getDoc(hisRef);
        const hisStars = hisSnap.data()?.stars || 0;
        await setDoc(hisRef, { stars: hisStars + amountNum }, { merge: true });

        addGiftedStars(amountNum);
        checkAchievements();

        showToast(`🎁 Подарено ${amountNum} ⭐!`);
        modal.classList.add("hidden");
    } catch (e) {
        console.error("Ошибка подарка:", e);
        showToast("❌ Ошибка");
    }
}

function initFriendsPage() {
    document.querySelector("#friendsSearchForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nick = document.querySelector("#friendsSearchInput").value.trim();
        if (!nick) return;
        const found = await searchUserByNick(nick);
        renderSearchResult(found);
    });

    document.addEventListener("click", async (e) => {
        const target = e.target.closest("button");
        if (!target) return;

        if (target.dataset.addFriend) {
            await sendFriendRequest(target.dataset.addFriend);
            return;
        }
        if (target.dataset.accept) {
            await acceptRequest(target.dataset.accept, target.dataset.from, target.dataset.fromname);
            return;
        }
        if (target.dataset.reject) {
            await rejectRequest(target.dataset.reject);
            return;
        }
        if (target.dataset.viewFriend) {
            await showFriendProfile(target.dataset.viewFriend);
            return;
        }
        if (target.dataset.gift) {
            await showFriendProfile(target.dataset.gift);
            return;
        }
        if (target.dataset.giftConfirm) {
            const amount = document.querySelector("#giftAmountInput")?.value;
            await giveStarsToFriend(target.dataset.giftConfirm, amount);
            return;
        }
        if (target.dataset.removeFriend) {
            await removeFriend(target.dataset.removeFriend);
            return;
        }
    });

    document.querySelector("#friendsNavBtn")?.addEventListener("click", async () => {
        await renderRequests();
        await renderFriends();
        await updateFriendsBadge();
    });
}

function getFriendsCount() {
    return parseInt(localStorage.getItem("vc_friends_count") || "0");
}

function getGiftedStars() {
    return parseInt(localStorage.getItem("vc_gifted_stars") || "0");
}

function addGiftedStars(amount) {
    const current = getGiftedStars();
    localStorage.setItem("vc_gifted_stars", String(current + amount));
}

const _origRenderProfileForFriends = renderProfile;
window.renderProfile = async function () {
    _origRenderProfileForFriends();

    const user = currentUser();
    if (user && window.firebaseDB) {
        const data = await getUserData(user.email);
        const friendsCount = data?.friends?.length || 0;
        const el = document.querySelector("#profileFriendsCount");
        if (el) el.textContent = friendsCount;
    }
};

async function initFriendsOnLoad() {
    await updateFriendsBadge();
    await showFriendsNotification();
}

window.addEventListener("load", () => {
    setTimeout(initFriendsOnLoad, 2500);
});

initFriendsPage();

/* ================= СТРАНИЦА ПРОФИЛЯ ДРУГА ================= */

let currentFriendEmail = null;

async function openFriendPage(friend) {
    currentFriendEmail = friend.email;

    const isAdmin = isAdminUser(friend.email);
    const isFriend = isFriendUser(friend.email);
    const isSuper = isSuperUser(friend.email);

    let displayName = friend.name || "Без имени";
    if (isAdmin) displayName = "👑 " + displayName;
    else if (isFriend) displayName = "🤝 " + displayName;
    else if (isSuper) displayName = "⭐ " + displayName;

    document.querySelector("#friendPageTitle").textContent = "◉ " + displayName;
    document.querySelector("#friendName").textContent = displayName;

    const avatarEl = document.querySelector("#friendAvatar");
    const friendLetter = (friend.name || "?")[0].toUpperCase();
    avatarEl.setAttribute("data-letter", friendLetter);

    avatarEl.innerHTML = "";

    if (friend.activeAvatar) {
        avatarEl.innerHTML = `<img src="images/avatar-${friend.activeAvatar}.png" alt="avatar">`;
    } else {
        avatarEl.innerHTML = `<span style="position:relative;z-index:5;color:#fff;font-size:44px;font-weight:700;text-shadow:0 2px 6px rgba(0,0,0,.5);">${friendLetter}</span>`;
    }
    avatarEl.className = "profile-avatar";
    if (friend.activeFrame) {
        avatarEl.classList.add("frame-" + friend.activeFrame);
    }

    document.querySelector("#friendNickDisplay").textContent = "@" + (friend.nick || "без_ника");

    const registered = friend.registered || Date.now();
    const registeredDate = new Date(registered).toLocaleDateString("ru-RU");
    document.querySelector("#friendDate").textContent = registeredDate;

    const achievements = friend.achievements || [];
    document.querySelector("#friendStars").textContent = friend.stars || 0;
    document.querySelector("#friendAchv").textContent = `${achievements.length}/${ACHIEVEMENTS.length}`;
    document.querySelector("#friendDays").textContent = Math.max(1, Math.floor((Date.now() - registered) / 86400000) + 1);
    document.querySelector("#friendCooked").textContent = friend.stats?.opened || 0;

    const friendFriends = friend.friends || [];
    document.querySelector("#friendFriendsCount").textContent = friendFriends.length;

    const friendsOfFriend = await Promise.all(
        friendFriends.map(e => getUserData(e))
    );

    const friendsListEl = document.querySelector("#friendFriendsList");
    if (friendsOfFriend.filter(f => f).length === 0) {
        friendsListEl.innerHTML = `<span class="friend-chip">Нет друзей</span>`;
    } else {
        friendsListEl.innerHTML = friendsOfFriend
            .filter(f => f)
            .map(f => `<span class="friend-chip">${(f.name || "?")[0].toUpperCase()} ${f.name || ""}</span>`)
            .join("");
    }

    const grid = document.querySelector("#friendAchievementsGrid");
    grid.innerHTML = ACHIEVEMENTS.map(a => {
        const unlocked = achievements.includes(a.id);
        return `
            <div class="achievement ${unlocked ? "unlocked" : "locked"}">
                <span class="ach-icon">${a.icon}</span>
                <b>${a.name}</b>
                <small>${a.desc}</small>
            </div>`;
    }).join("");

    const giftBtn = document.querySelector("#friendGiftBtn");
    const giftInput = document.querySelector("#friendGiftAmount");

    giftBtn.onclick = async () => {
        const amount = parseInt(giftInput.value);
        if (!amount || amount < 1) {
            showToast("❌ Введи число больше 0");
            return;
        }
        await giveStarsToFriend(friend.email, amount);
    };

    switchTab("friend");
}

document.querySelector("#friendBackBtn")?.addEventListener("click", async () => {
    switchTab("friends");
    await renderFriends();
});
