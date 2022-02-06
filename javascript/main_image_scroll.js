var imageNum = 1;
showImage(imageNum);

function nextImage(n){
    showImage(imageNum+=n);
}

function showImage(n){
    var images = document.getElementsByClassName('mainImage');
    if(n>images.length) {
        imageNum=1;
    }
    if(n<1) {
        imageNum=images.length;
    }
    for (i = 0; i < images.length; i++) {
        images[i].style.display = "none";
    }
    images[imageNum-1].style.display = "block";
}