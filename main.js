const tasks = {
    design: [],
    implementation: [],
    test: []
};

//ボタンを取得
const generateBtn = document.getElementById("generateBtn");

//ボタンクリック時処理
generateBtn.addEventListener("click", () => {
    const csvRows = buildCsvRows();
    const csvText = convertToCSV(csvRows);

    downloadCsv(csvText, "jira_tasks.csv")
});

const taskGroups = document.querySelectorAll(".task-group");

taskGroups.forEach((group) => {
    const addButton = group.querySelector(".add-part-btn");
    const input = group.querySelector("input");
    const partsList = group.querySelector(".parts-list");
    const taskKey = group.dataset.taskKey;

    addButton.addEventListener("click", () => {
        const partName = input.value.trim();
        if (partName === "") return;

        // データに追加
        tasks[taskKey].push(partName);

        // 入力欄クリア
        input.value = "";

        // 再描画
        renderParts(partsList, tasks[taskKey]);

        saveTasks();
    });

    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            addButton.click();
        }
    });
});

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
    rows.push(["要約", "課題タイプ", "進捗"]);

    stories.forEach(story => {
        if (!story.enabled) return;

        //ストーリー行
        rows.push([story.label, "ストーリー", ""]);

        //配下のタスク
        const taskList = tasks[story.name] || [];

        taskList.forEach(taskName => {
            rows.push([
                taskName,
                "タスク",
                "未着手"
            ]);
        });
    });

    return rows;
};

function convertToCSV(rows) {
    return rows
        .map(row =>
            row.map(value => `"${value}`).join(",")
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

const clearBtn = document.getElementById("clearBtn");

clearBtn.addEventListener("click", () => {
    //データ初期化
    Object.keys(tasks).forEach(key => {
        tasks[key] = [];
    });

    //表示クリア
    document.querySelectorAll(".parts-list").forEach(list => {
        list.innerHTML = "";
    });

    localStorage.removeItem("tasks");
});

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
    const saved = localStorage.getItem("tasks");
    if (!saved) return;

    const parsedTasks = JSON.parse(saved);

    //tasks に復元
    Object.keys(tasks).forEach(key => {
        tasks[key] = parsedTasks[key] || [];
    });

    //画面に反映
    document.querySelectorAll(".task-group").forEach(group => {
        const taskKey = group.dataset.taskKey;
        const partsList = group.querySelector(".parts-list");
        renderParts(partsList, tasks[taskKey]);
    });
}

//ページ読み込み時に復元
loadTasks();