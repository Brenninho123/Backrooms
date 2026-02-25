export function updateUI(flash, sanity) {
    document.getElementById("flashFill").style.width = flash + "%";
    document.getElementById("sanityFill").style.width = sanity + "%";
}
