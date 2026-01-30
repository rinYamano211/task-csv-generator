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
    console.log(csvRows);
//    //プロジェクトのチェックボックスをすべて取得
//    const projectCheckboxes = document.querySelectorAll(
//        'input[name="project"]:checked'
//    );
//
//    //タスク種別のチェックボックスをすべて取得
//    const taskTypeCheckboxes = document.querySelectorAll(
//        'input[name="taskType"]:checked'
//    );
//
//    //取得した値を配列に変換
//    const selectedProjects = Array.from(projectCheckboxes).map(
//        (checkbox) => checkbox.value
//    );
//
//    const selectedTaskTypes = Array.from(taskTypeCheckboxes).map(
//        (checkbox) => checkbox.value
//    );
//
//    //確認用
//    console.log("projects:", selectedProjects);
//    console.log("Task Types:", selectedTaskTypes);
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