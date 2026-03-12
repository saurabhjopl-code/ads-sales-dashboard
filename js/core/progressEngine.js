export function startProgress() {
    document.getElementById("progress-bar").style.width = "60%";
}

export function finishProgress() {
    document.getElementById("progress-bar").style.width = "100%";
    setTimeout(() => {
        document.getElementById("progress-bar").style.width = "0%";
    }, 400);
}
