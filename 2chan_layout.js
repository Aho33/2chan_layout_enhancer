// ==UserScript==
// @name         Modify 2chan Layout
// @version      0.6.2
// @match        https://*.2chan.net/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function addStyle(css) {
        const style = document.createElement("style")
        style.innerHTML = css
        document.head.appendChild(style)
    }
    addStyle(`
    .viewer-backdrop {
        background-color: transparent !important;
    }
    .viewer-footer, .viewer-close{
        display: none !important;
    }
    `)

    function removeWhitePixelsFromFavicon() {
        const linkElements = document.getElementsByTagName('link');

        for (let i = 0; i < linkElements.length; i++) {
            const linkElement = linkElements[i];
            if (linkElement.getAttribute('rel') === 'icon' || linkElement.getAttribute('rel') === 'shortcut icon') {
                const faviconURL = linkElement.getAttribute('href');
                const canvas = document.createElement('canvas');
                const img = new Image();

                img.onload = function() {
                    canvas.width = img.width;
                    canvas.height = img.height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const pixels = imageData.data;

                    for (let i = 0; i < pixels.length; i += 4) {
                        const r = pixels[i];
                        const g = pixels[i + 1];
                        const b = pixels[i + 2];

                        // Check if the pixel is white (255, 255, 255)
                        if (r === 255 && g === 255 && b === 255) {
                            pixels[i + 3] = 0; // Set alpha value to 0 to make it transparent
                        }
                    }

                    ctx.putImageData(imageData, 0, 0);

                    const newFaviconURL = canvas.toDataURL();
                    linkElement.setAttribute('href', newFaviconURL);
                };

                img.src = faviconURL;
                break;
            }
        }
    }
    removeWhitePixelsFromFavicon()

    function createFavIconNotifications() {
        // Create a canvas element
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const context = canvas.getContext('2d');

        // Create an Image object to load the preexisting favicon
        const faviconImg = new Image();
        faviconImg.onload = function () {
            // Draw the preexisting favicon
            // context.drawImage(faviconImg, 0, 0, canvas.width, canvas.height);

            // Draw a green circle
            context.beginPath();
            context.arc(11, 11, 5, 0, 2 * Math.PI);
            context.fillStyle = 'green';
            context.fill();

            // Draw the timer text
            context.font = '10px sans-serif';
            context.fillStyle = 'white';
            context.textAlign = 'center';
            context.textBaseline = 'middle';

        };

        // Set the source of the Image object to the preexisting favicon URL
        faviconImg.src = "https://may.2chan.net/favicon.ico";

        // Update the favicon with the modified canvas
        function updateFavicon() {
            const link = document.querySelector("link[rel*='icon']");
            if (link) {
                link.href = canvas.toDataURL();
            } else {
                const newLink = document.createElement('link');
                newLink.rel = 'icon';
                newLink.href = canvas.toDataURL();
                document.head.appendChild(newLink);
            }
        }

        function resetFavicon() {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(faviconImg, 0, 0, canvas.width, canvas.height);
            updateFavicon();
        }

        function redrawFavicon(newPostsLength) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(faviconImg, 0, 0, canvas.width, canvas.height);
            context.beginPath();
            context.arc(11, 11, 5, 0, 2 * Math.PI);
            context.fillStyle = 'green';
            context.fill();
            context.fillStyle = 'white';
            context.fillText(newPostsLength.toString(), 11, 11);
            updateFavicon();
        }

        function drawDeadFavicon(){
            context.beginPath();
            context.strokeStyle = "red"
            context.lineWidth = 2
            context.moveTo(canvas.width/2, canvas.height/2);
            context.lineTo(canvas.width, canvas.height);
            context.moveTo(canvas.width, canvas.height/2);
            context.lineTo(canvas.width/2, canvas.height);

            context.stroke();
            context.fill();
            updateFavicon();
        }
        return { redrawFavicon, resetFavicon, drawDeadFavicon}
    }

    function handleNewPosts() {
        function highlightBorders(newPosts) {
            newPosts.forEach(
                (post) => {
                    post.classList.add("newPost")
                }
            )
        }
        addStyle(`
        .newPost  .rtd {
            border-left: 3px solid red !important;
            border-right: 3px solid red !important;
        }
        `)
        window.addEventListener('click', () => {
            const newPosts = [...document.querySelectorAll('.newPost')];
            newPosts.forEach(
                (post) => {
                    post.classList.remove("newPost")
                }
            )
        })
        return { highlightBorders }
    }

    addStyle(`
    div:has(>.extendWebm) {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: inline-block;
    }
    .cancelbk {
        display: none;
    }
    `)
    let isVideoShown = false
    window.addEventListener('click', (e)=>{
        if (e.target.nodeName == 'VIDEO'){
            return
        }
        if (isVideoShown){
            document.querySelector(".cancelbk").click()
            isVideoShown = false
            return
        }
        if (document.querySelector(".extendWebm")){
            isVideoShown = true
        }


    })

    window.addEventListener('load', function () {
        // Remove div classes
        const divElements = document.querySelectorAll('iframe');
        divElements.forEach(function (divElement) {
            divElement.remove();
        });


        const divElements2 = document.querySelectorAll('div');
        divElements2.forEach(function (divElement2) {
            if (divElement2.innerText == '') {
                divElement2.remove();
            }
        });

        const imageLinks = [...document.querySelectorAll('a[href$=".jpg"], a[href$=".jpeg"], a[href$=".png"], a[href$=".gif"]')];


        // Load Viewer library
        const lightboxScript = document.createElement('script');
        lightboxScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.11.3/viewer.min.js';
        document.head.appendChild(lightboxScript);

        lightboxScript.addEventListener('load', function () {
            imageLinks.forEach(img => {
                addViewer(img);
            });
        });

        const lightboxStylesheet = document.createElement('link');
        lightboxStylesheet.rel = 'stylesheet';
        lightboxStylesheet.href = 'https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.11.3/viewer.min.css';
        document.head.appendChild(lightboxStylesheet);

        function addViewer(img) {
            img.addEventListener('click', (e) => {
                e.preventDefault();
            });
            const viewer = new Viewer(img, {
                viewed() {
                    viewer.zoomTo(window.innerHeight / img.innerHeight);
                },
                zoomRatio: 0.3,
                transition: false,
                url(image) {
                    return image.parentElement.href;
                },
            });
        }

        const updateTime = 30

        let lastUpdate = new Date()
        if (document.querySelector('.thre')){
        let domObserver = new MutationObserver(()=>{
            getNewPostCount()
        })
        domObserver.observe(document.querySelector('.thre'), {
            subtree: true, childList: true
        })
        }
        let isDead = false
        let intervalID = setInterval(() => {
            if (document.querySelector('span#contdisp')?.innerText.includes("スレッドがありません")){
                drawDeadFavicon();
                document.title = "{404} " + documentTitle
                isDead = true
                ///document.querySelector('#contres')?.remove()
                document.querySelector('#contres').remove()
                clearInterval(intervalID)
                return
            }

            lastUpdate = new Date()
            if (isVideoShown){
                return
            }
            document.querySelector('#contres a')?.click();

            setTimeout(() => {
                const newimageLinks = [...document.querySelectorAll('a[href$=".jpg"], a[href$=".jpeg"], a[href$=".png"], a[href$=".gif"], a[href$=".webp"]')].filter((newimage) => {
                    return !imageLinks.includes(newimage);
                });
                newimageLinks.forEach(img => {
                    addViewer(img);
                });
                imageLinks.push(...newimageLinks);
            }, 2000);
        }, 1000 * updateTime);

        const timer = document.createElement('div')
        if (!isDead){
            setInterval(() => {
                const timePassed = updateTime - Math.floor((new Date() - lastUpdate) / 1000)
                if (document.querySelector('#contres a')) {
                    document.querySelector('#contres a').innerHTML = reloadText + ": " + timePassed

                }
            }, 16)
        }

        addStyle(`
            #contres a {
                color: currentColor !important;
            }
            #contdisp {
                margin-left: 10px !important;
            }
        `)
        document.querySelector('#contres')?.appendChild(timer)

        document.querySelector('#contres')?.addEventListener('click', () => { lastUpdate = new Date() })

        const reloadText = document.querySelector('#contres a')?.innerHTML

        const { redrawFavicon, resetFavicon, drawDeadFavicon } = createFavIconNotifications()
        const { highlightBorders } = handleNewPosts()

        function getNewPostCount() {
            if (isTabVisible) {
                return
            }
            newPosts = [...document.querySelectorAll('.thre > table')].filter((newpost) => {
                return !posts.includes(newpost);
            });
            if (newPosts.length != 0) {
                highlightBorders(newPosts)
                redrawFavicon(newPosts.length)
                document.title = `[${newPosts.length}] ` + documentTitle;
            }
        }


        let isTabVisible = true;
        const posts = [...document.querySelectorAll('.thre > table')];
        let newPosts = []

        const documentTitle = document.title
        function handleVisibilityChange() {
            if (document.visibilityState === 'visible') {
                posts.push(...newPosts);
                newPosts = []
                if (!isDead){
                    document.title = documentTitle
                    resetFavicon()
                }
                isTabVisible = true;
            } else {
                isTabVisible = false;
            }
        }
        document.addEventListener('visibilitychange', handleVisibilityChange);



        const table = document.querySelector('#cattable');

        if (!table) {
            return;
        }

        const tds = [...table.children[0].children].reduce((acc, tr) => {
            acc.push(...tr.children);
            return acc;
        }, []);

        table.innerHTML = '';

        tds.forEach((td) => {
            table.appendChild(td);
            td.style.display = 'flex';
            td.style.justifyContent = 'center';
            td.style.alignItems = 'center';
            td.style.flexDirection = 'column';
            td.classList.add("cardStyle")

            const img = td.querySelector('img');
            if (!img) {
                return;
            }

            const [, board, id, ext] = img.src.match(/\/(\w*)\/cat\/(\w*)\.(\w*)/);

            img.src = `/${board}/thumb/${id}.${ext}`;

            img.height = img.height * 3;
            img.width = img.width * 3;
        });

        addStyle(`
            .cardStyle {
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                background-color: #FFFFEE;
                border: 1px solid #ddd;
                border-radius: 5px;
                padding: 10px;
                margin: 5px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                color: #333;
            }

            /* Additional styles for hover effect */
            .cardStyle:hover {
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
                transform: translateY(-4px);
                transition: all 0.3s ease-in-out;
            }
        `)

        table.classList.add("newTable")
        addStyle(`
            .newTable  {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
            }
            .newTable td {
                width: calc(100%/9);
            }
        `)
    });
})();