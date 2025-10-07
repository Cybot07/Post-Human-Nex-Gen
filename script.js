// Update lyrics highlight - FIXED SMOOTH AUTO-SCROLL
function updateLyricsHighlight(currentTime) {
    // ... kode untuk cari lirik yang aktif ...
    
    // Smooth auto-scroll hanya di lyrics container
    const container = document.querySelector('.lyrics-container');
    const lineTop = currentLine.offsetTop;
    const lineHeight = currentLine.offsetHeight;
    const containerHeight = container.clientHeight;
    const containerScrollTop = container.scrollTop;

    // Calculate the position to scroll to (center the line)
    const scrollTo = lineTop - (containerHeight / 2) + (lineHeight / 2);

    // Only scroll if the line is not in the visible area
    const buffer = 50; // Buffer zone in pixels
    const isLineVisible = (
        lineTop >= (containerScrollTop + buffer) && 
        (lineTop + lineHeight) <= (containerScrollTop + containerHeight - buffer)
    );

    if (!isLineVisible) {
        container.scrollTo({
            top: scrollTo,
            behavior: 'smooth'
        });
    }
}