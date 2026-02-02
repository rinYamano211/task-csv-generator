// ===== 定数定義 =====

const STORAGE_KEY = "tasks";
const TASK_STATUS = "未着手";
const CSV_FILENAME = "jira_tasks.csv";

const CSV_HEADER = ["要約", "課題タイプ", "進捗"];

const ISSUE_TYPE = {
    STORY: "ストーリー",
    TASK: "タスク"
};

// ===== 状態 =====
const tasks = {
    design: [],
    implementation: [],
    test: []
};


// ===== DOM =====
const generateBtn = document.getElementById("generateBtn");
const clearBtn = document.getElementById("clearBtn");
const taskGroups = document.querySelectorAll(".task-group");


// ===== 初期化 =====
loadTasks();
taskGroups.forEach(initTaskGroup);


// ===== イベント =====
generateBtn.addEventListener("click", () => {
    const csvRows = buildCsvRows();
    const csvText = convertToCSV(csvRows);

    downloadCsv(csvText, CSV_FILENAME)
});

clearBtn.addEventListener("click", () => {
    //データ初期化
    Object.keys(tasks).forEach(key => {
        tasks[key] = [];
    });

    localStorage.removeItem(STORAGE_KEY);
    renderAllTasks();
});


/**
 * 各工程（task-group）のイベントを初期化する
 */
function initTaskGroup(group) {
    const addButton = group.querySelector(".add-part-btn");
    const input = group.querySelector("input");
    const partsList = group.querySelector(".parts-list");
    const taskKey = group.dataset.taskKey;

    addButton.addEventListener("click", () => {
        addTask(taskKey, input);
    });

    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            addButton.click();
        }
    });
}

/**
 * 指定された工程にタスクを追加し、表示と保存を更新する
 */
function addTask(taskKey, input) {
    const partName = input.value.trim();
    if (partName === "") return;

    tasks[taskKey].push(partName);
    input.value = "";

    renderAllTasks();
    saveTasks();
}

/**
 * tasks の内容をすべて画面に再描画する
 */
function renderAllTasks() {
    document.querySelectorAll(".task-group").forEach(group => {
        const taskKey = group.dataset.taskKey;
        const partsList = group.querySelector(".parts-list");

        renderParts(partsList, tasks[taskKey]);
    });
}

function renderParts(listElement, parts) {
    listElement.innerHTML = "";

    parts.forEach((part) => {
        const li = document.createElement("li");
        li.textContent = part;
        listElement.appendChild(li);
    });
}

function getStories() {
    const storyCheckboxes = document.querySelectorAll(
        'input[name="taskType"]'
    );

    return Array.from(storyCheckboxes).map(cb => ({
        name: cb.value,
        label: cb.parentElement.textContent.trim(),
        enabled: cb.checked
    }));
}

function buildCsvRows() {
    const rows =[];
    const stories = getStories();

    //ヘッダ
    rows.push(CSV_HEADER);

    stories.forEach(story => {
        if (!story.enabled) return;

        //ストーリー行
        rows.push([story.label, ISSUE_TYPE.STORY, ""]);

        //配下のタスク
        const taskList = tasks[story.name] || [];

        taskList.forEach(taskName => {
            rows.push([
                taskName,
                ISSUE_TYPE.TASK,
                TASK_STATUS
            ]);
        });
    });

    return rows;
};

function convertToCSV(rows) {
    return rows
        .map(row =>
            row.map(value => `"${value}"`).join(",")
        )
        .join("\n")
}

function downloadCsv(text, filename) {
    const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
    const url =URL.createObjectURL(blob);

    const a =document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    const parsedTasks = JSON.parse(saved);

    //tasks に復元
    Object.keys(tasks).forEach(key => {
        tasks[key] = parsedTasks[key] || [];
    });

    renderAllTasks();
}