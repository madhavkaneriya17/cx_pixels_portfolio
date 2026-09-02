/* <=== preloder start ===> */
const tl = gsap.timeline({
    onComplete: () => {
        document.body.style.overflow = "auto";
    }
});

gsap.set(".letters .char, .unique path", { opacity: 0, y: 15 });

gsap.set(".house-path", {
    transformOrigin: "50% 50%",
    x: -276.5,
    y: -39,
    scale: 5
});
gsap.set(".house-path rect", {
    fill: "#007aff"
});

tl.to(".house-path rect", { fill: "#f78da7", duration: 0.35, ease: "power1.inOut" })
    .to(".house-path rect", { fill: "#cf2e2e", duration: 0.35, ease: "power1.inOut" })
    .to(".house-path rect", { fill: "#fcb900", duration: 0.35, ease: "power1.inOut" })
    .to(".house-path rect", { fill: "#525ddc", duration: 0.35, ease: "power1.inOut" })
    .to(".house-path rect", { fill: "#000000", duration: 0.35, ease: "power1.inOut" })
    .to(".house-path", {
        x: 0,
        y: 0,
        scale: 1,
        duration: 1.2,
        ease: "power3.inOut"
    })
    .to(".letters .char", {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.05,
        ease: "power2.out"
    }, "-=0.2")
    .to(".unique path", {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.02,
        ease: "power2.out"
    }, "-=0.1")
    .to(".preloader", {
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut",
        delay: 0.3,
        onComplete: () => {
            const preloader = document.querySelector(".preloader");
            if (preloader) {
                preloader.style.display = "none";
            }
        }
    });
/* <=== preloder end ===> */

/* <=== three js section start ===> */
const container = document.getElementById('container');
const canvas = document.getElementById('tunnel-canvas');
const customCursor = document.getElementById('customCursor');

if (container && canvas) {
    const scene = new THREE.Scene();
    const bgColor = 0xf1e9e0;
    scene.background = new THREE.Color(bgColor);

    scene.fog = new THREE.Fog(bgColor, 14, 34);

    const rect = container.getBoundingClientRect();
    const camera = new THREE.PerspectiveCamera(65, rect.width / rect.height, 0.1, 1000);
    camera.position.z = 0;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(rect.width, rect.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const tunnelWidth = 8;
    const gridCols = 4;
    const cellSize = tunnelWidth / gridCols;
    const ringDepth = 2;
    const numRings = 25;

    const colors = [
        0xFFC857,
        0xFF6F61,
        0x2DD4BF,
        0x5B8CFF,
        0xA855F7,
        0x84CC16
    ];

    const textureLoader = new THREE.TextureLoader();
    const sampleImages = [
        'assets/images/threejs-image-1.png',
        'assets/images/threejs-image-2.png',
        'assets/images/threejs-image-3.png',
        'assets/images/threejs-image-4.png'
    ];
    const textures = sampleImages.map(url => textureLoader.load(url));

    const gridGroup = new THREE.Group();
    scene.add(gridGroup);

    const lineMat = new THREE.LineBasicMaterial({ color: 0x222222, opacity: 0.5, transparent: true, linewidth: 1 });
    const cellGeo = new THREE.PlaneGeometry(cellSize, ringDepth);

    function create4GridRing(zPos) {
        const ringGroup = new THREE.Group();

        const halfW = tunnelWidth / 2;
        const halfCell = cellSize / 2;

        const walls = [
            { type: 'bottom', rotate: [-Math.PI / 2, 0, 0] },
            { type: 'top', rotate: [Math.PI / 2, 0, 0] },
            { type: 'left', rotate: [0, Math.PI / 2, 0] },
            { type: 'right', rotate: [0, -Math.PI / 2, 0] }
        ];

        walls.forEach(wall => {
            for (let i = 0; i < gridCols; i++) {
                const offset = -halfW + halfCell + (i * cellSize);

                let px = 0, py = 0;

                if (wall.type === 'bottom') { px = offset; py = -halfW; }
                else if (wall.type === 'top') { px = offset; py = halfW; }
                else if (wall.type === 'left') { px = -halfW; py = offset; }
                else if (wall.type === 'right') { px = halfW; py = offset; }

                const wireGeo = new THREE.EdgesGeometry(cellGeo);
                const wireframe = new THREE.LineSegments(wireGeo, lineMat);
                wireframe.position.set(px, py, 0);
                wireframe.rotation.set(...wall.rotate);
                ringGroup.add(wireframe);

                const rand = Math.random();
                if (rand > 0.60) {
                    let tileMat;
                    if (Math.random() > 0.40) {
                        const col = colors[Math.floor(Math.random() * colors.length)];
                        tileMat = new THREE.MeshBasicMaterial({
                            color: col,
                            side: THREE.DoubleSide
                        });
                    } else {
                        const tex = textures[Math.floor(Math.random() * textures.length)];
                        tileMat = new THREE.MeshBasicMaterial({
                            map: tex,
                            side: THREE.DoubleSide,
                            transparent: true,
                            opacity: 0.9
                        });
                    }

                    const tileMesh = new THREE.Mesh(cellGeo, tileMat);
                    tileMesh.position.set(px, py, 0);
                    tileMesh.rotation.set(...wall.rotate);
                    ringGroup.add(tileMesh);
                }
            }
        });

        ringGroup.position.z = zPos;
        return ringGroup;
    }

    const rings = [];
    for (let i = 0; i < numRings; i++) {
        const ring = create4GridRing(-i * ringDepth);
        gridGroup.add(ring);
        rings.push(ring);
    }

    let baseSpeed = 0.05;
    let currentSpeed = baseSpeed;
    let targetSpeed = baseSpeed;

    const startAccelerating = () => {
        targetSpeed = 0.35;
        if (customCursor) {
            customCursor.classList.add('active');
            customCursor.innerText = "Accelerating...";
        }
    };

    const stopAccelerating = () => {
        targetSpeed = baseSpeed;
        if (customCursor) {
            customCursor.classList.remove('active');
            customCursor.innerText = "Press to Start";
        }
    };

    container.addEventListener('mousemove', (e) => {
        if (customCursor) {
            customCursor.style.left = e.clientX + 'px';
            customCursor.style.top = e.clientY + 'px';
        }
    });

    container.addEventListener('mousedown', startAccelerating);
    window.addEventListener('mouseup', stopAccelerating);

    container.addEventListener('touchstart', () => startAccelerating(), { passive: true });
    window.addEventListener('touchend', stopAccelerating);
    window.addEventListener('touchcancel', stopAccelerating);

    const resizeHandler = () => {
        const r = container.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
            camera.aspect = r.width / r.height;
            camera.updateProjectionMatrix();
            renderer.setSize(r.width, r.height);
        }
    };

    window.addEventListener('resize', resizeHandler);
    if (window.ResizeObserver) {
        new ResizeObserver(resizeHandler).observe(container);
    }

    function animate() {
        requestAnimationFrame(animate);

        currentSpeed += (targetSpeed - currentSpeed) * 0.08;
        camera.position.z -= currentSpeed;

        scene.fog.near = Math.abs(camera.position.z) + 12;
        scene.fog.far = Math.abs(camera.position.z) + 32;

        rings.forEach(ring => {
            if (ring.position.z > camera.position.z) {
                ring.position.z -= numRings * ringDepth;
            }
        });

        renderer.render(scene, camera);
    }

    animate();
}
/* <=== three js section end ===> */

/* <=== What define us section start ===> */
function createDropAnimation(targetClass, delayTime) {
    gsap.timeline({ repeat: -1, delay: delayTime })
        .to(targetClass, {
            y: 45,
            scaleY: 1.2,
            duration: 0.4,
            ease: "power2.in",
            force3D: true
        })
        .set(targetClass, {
            y: -45,
            force3D: true
        })
        .to(targetClass, {
            y: 0,
            scaleY: 1,
            duration: 0.5,
            ease: "power2.out",
            force3D: true
        })
        .to(targetClass, {
            duration: 1.5
        });
}
createDropAnimation(".arrow-group._1", 0);
createDropAnimation(".arrow-group._2", 0.15);
/* <=== What define us section end ===> */

/* <=== common button start ===> */
class ShapeOverlays {
    constructor(container, options = {}) {
        this.container = container;
        this.color = options.color || this.container.getAttribute("data-color") || "#0072E3";
        this.overlay = this.container.querySelector(".shape-overlays");
        this.paths = this.container.querySelectorAll(".shape-overlays__path");
        this.colors = ["#EA3737", "#004E9B", "#FFB200", "#FF5C38", "#0072E3"];
        this.numPoints = 3;
        this.numPaths = this.paths.length;
        this.delayPointsMax = 0.2;
        this.delayPerPath = 0.2;
        this.duration = 0.9;
        this.delay = 0;
        this.isOpened = false;

        this.pointsDelay = [];
        this.allPoints = [];
        this.callback = function () { };

        this.init();
        this.attachHoverListeners();
        this.toggle(false, () => { }, this.color, 0);
    }

    init() {
        this.tl = gsap.timeline({
            onUpdate: this.render.bind(this),
            defaults: {
                ease: "power2.inOut",
                duration: this.duration,
                delay: this.delay
            },
            onComplete: () => {
                this.callback();
            }
        });

        for (let t = 0; t < this.numPaths; t++) {
            let n = [];
            this.allPoints.push(n);
            for (let i = 0; i < this.numPoints; i++) {
                n.push(100);
            }
        }
    }

    toggle(isOpened, callback, color, duration = 0.3) {
        this.callback = callback;
        if (isOpened) {
            this.isOpened = true;
            const selector = gsap.utils.selector(this.container);

            gsap.utils.shuffle(this.colors);

            if (color) {
                gsap.set(selector("._2"), { fill: this.colors[1] });
                gsap.set(selector("._3"), { fill: color });
            } else {
                gsap.set(selector("._2"), { fill: this.colors[1] });
                gsap.set(selector("._3"), { fill: this.colors[2] });
            }
        } else {
            this.isOpened = false;
        }

        this.tl.progress(0).clear();

        for (let a = 0; a < this.numPoints; a++) {
            this.pointsDelay[a] = Math.random() * this.delayPointsMax;
        }

        for (let o = 0; o < this.numPaths; o++) {
            let pathPoints = this.allPoints[o];
            let delayOffset = this.delayPerPath * (this.isOpened ? o : this.numPaths - o - 1);

            for (let u = 0; u < this.numPoints; u++) {
                let pointDelay = this.pointsDelay[u];
                this.tl.fromTo(pathPoints, {
                    [u]: 100
                }, {
                    [u]: 0,
                    duration: duration
                }, pointDelay + delayOffset);
            }
        }
    }

    attachHoverListeners() {
        this.onMouseEnter = () => {
            this.toggle(true, () => { }, this.color);
        };
        this.onMouseLeave = () => {
            this.toggle(false, () => { });
        };
        this.container.addEventListener("mouseenter", this.onMouseEnter);
        this.container.addEventListener("mouseleave", this.onMouseLeave);
    }

    render() {
        for (let t = 0; t < this.numPaths; t++) {
            let pathEl = this.paths[t];
            let points = this.allPoints[t];
            let pathStr = "";

            pathStr += this.isOpened ? `M 0 0 V ${points[0]} C` : `M 0 ${points[0]} C`;

            for (let s = 0; s < this.numPoints - 1; s++) {
                let nextX = ((s + 1) / (this.numPoints - 1)) * 100;
                let ctrlX = nextX - (1 / (this.numPoints - 1)) * 100 / 2;
                pathStr += ` ${ctrlX} ${points[s]} ${ctrlX} ${points[s + 1]} ${nextX} ${points[s + 1]}`;
            }

            pathStr += this.isOpened ? " V 100 H 0" : " V 0 H 0";
            pathEl.setAttribute("d", pathStr);
        }
    }

    destroy() {
        this.container.removeEventListener("mouseenter", this.onMouseEnter);
        this.container.removeEventListener("mouseleave", this.onMouseLeave);
        if (this.tl) this.tl.kill();
        this.container = null;
        this.overlay = null;
        this.paths = null;
        this.colors = null;
        this.allPoints = null;
        this.pointsDelay = null;
        this.callback = null;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".js-color-button-fill").forEach(btn => {
        new ShapeOverlays(btn);
    });
});
/* <=== common button end ===> */

/* <=== location section map start ===> */
const mapElement = document.getElementById('map');
if (mapElement) {
    const initialZoom = window.innerWidth < 768 ? 13.5 : 14.5;
    const centerPos = [21.8380, 73.7191];

    const map = L.map('map', {
        zoomControl: false,
        attributionControl: false
    }).setView(centerPos, initialZoom);

    const tileClass = document.body.classList.contains('contact-page') ? 'responsive-cream-tiles' : 'responsive-yellow-tiles';

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        className: tileClass,
        subdomains: 'abcd'
    }).addTo(map);

    const isContactPage = document.body.classList.contains('contact-page');

    let markerHtml = "<div class='units-marker'>Statue of Unity</div>";
    let iconAnchor = [50, 15];

    if (isContactPage) {
        markerHtml = `<div class='custom-contact-marker-container'>
            <div class='contact-units-marker'>Units Parkside</div>
            <div class='contact-marker-house-icon'>
                <svg width='30' height='30' viewBox='0 0 24 24' fill='black' xmlns='http://www.w3.org/2000/svg'>
                    <path d='M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z'/>
                </svg>
            </div>
        </div>`;
        iconAnchor = [60, 60];
    }

    const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: markerHtml,
        iconSize: null,
        iconAnchor: iconAnchor
    });

    L.marker([21.8380, 73.7191], { icon: customIcon }).addTo(map);

    window.addEventListener('resize', () => {
        const newZoom = window.innerWidth < 768 ? 13.5 : 13;
        map.setZoom(newZoom);
        map.invalidateSize();
    });

    setTimeout(() => {
        map.invalidateSize();
    }, 200);
}
/* <=== location section map end ===> */

/* <=== marqe start ===> */
document.addEventListener("DOMContentLoaded", () => {
    const marquees = document.querySelectorAll(".marquee");
    const duration = 20;

    marquees.forEach(marquee => {
        let contents = marquee.querySelectorAll(".marquee-content");

        if (contents.length === 1) {
            const clone = contents[0].cloneNode(true);
            clone.setAttribute("aria-hidden", "true");
            marquee.appendChild(clone);
            contents = marquee.querySelectorAll(".marquee-content");
        }

        gsap.to(contents, {
            xPercent: -100,
            ease: "none",
            duration: duration,
            repeat: -1
        });
    });
});
/* <=== marqe end ===> */

/* <=== horizontal scroll start ===> */
document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

    const triggerElement = document.querySelector(".parellex-animation-section");
    const container = document.querySelector(".leving-grid-structure-main");

    if (triggerElement && container) {
        ScrollTrigger.matchMedia({
            "(min-width: 1024px)": function () {
                const getScrollAmount = () => {
                    let containerWidth = container.scrollWidth;
                    let visibleWidth = triggerElement.offsetWidth;
                    return -(containerWidth - visibleWidth + 20);
                };

                const tween = gsap.to(container, {
                    x: () => getScrollAmount(),
                    ease: "none",
                    scrollTrigger: {
                        trigger: triggerElement,
                        pin: true,
                        scrub: 1,
                        start: "top top",
                        end: () => `+=${container.scrollWidth - triggerElement.offsetWidth + 20}`,
                        invalidateOnRefresh: true,
                    }
                });

                return () => {
                    tween.kill();
                };
            }
        });
    }
});
/* <=== horizontal scroll end ===> */

/* <=== plant wind sway start ===> */
document.addEventListener("DOMContentLoaded", () => {
    const mainStem = document.querySelector(".wind-sway-main-stem");
    const branch1 = document.querySelector(".wind-sway-branch-1");
    const branch2 = document.querySelector(".wind-sway-branch-2");
    const branch3 = document.querySelector(".wind-sway-branch-3");
    const branch4 = document.querySelector(".wind-sway-branch-4");

    const leaf1 = document.querySelector(".wind-sway-leaf-1");
    const leaf2 = document.querySelector(".wind-sway-leaf-2");
    const leaf3 = document.querySelector(".wind-sway-leaf-3");
    const leaf4 = document.querySelector(".wind-sway-leaf-4");
    const leaf5 = document.querySelector(".wind-sway-leaf-5");

    if (!mainStem) return;

    function animatePlant(time) {
        const angleMain = Math.sin(time * 0.001) * 0.02;
        const cosM = Math.cos(angleMain);
        const sinM = Math.sin(angleMain);
        mainStem.setAttribute("transform", `matrix(${4 * cosM}, ${4 * sinM}, ${-4 * sinM}, ${4 * cosM}, 376.229, 394.321)`);

        const swayB1 = angleMain + Math.sin(time * 0.0014 + 0.5) * 0.035;
        const cos1 = Math.cos(swayB1); const sin1 = Math.sin(swayB1);
        branch1.setAttribute("transform", `matrix(${4 * cos1}, ${4 * sin1}, ${-4 * sin1}, ${4 * cos1}, 231.503, 214.985)`);

        const swayB2 = angleMain + Math.sin(time * 0.0012 + 1.2) * -0.03;
        const cos2 = Math.cos(swayB2); const sin2 = Math.sin(swayB2);
        branch2.setAttribute("transform", `matrix(${4 * cos2}, ${4 * sin2}, ${-4 * sin2}, ${4 * cos2}, 367.911, 446.595)`);

        const swayB3 = angleMain + Math.sin(time * 0.0015 + 0.8) * 0.04;
        const cos3 = Math.cos(swayB3); const sin3 = Math.sin(swayB3);
        branch3.setAttribute("transform", `matrix(${4 * cos3}, ${4 * sin3}, ${-4 * sin3}, ${4 * cos3}, 229.048, 587.028)`);

        const swayB4 = angleMain + Math.sin(time * 0.0011 + 2.0) * -0.032;
        const cos4 = Math.cos(swayB4); const sin4 = Math.sin(swayB4);
        branch4.setAttribute("transform", `matrix(${4 * cos4}, ${4 * sin4}, ${-4 * sin4}, ${4 * cos4}, 333.841, 557.984)`);

        if (leaf1) {
            const l1 = swayB1 + Math.sin(time * 0.0028 + 0.2) * 0.08;
            const cL1 = Math.cos(l1); const sL1 = Math.sin(l1);
            const a1 = 3.6926 * cL1 - 1.5377 * sL1;
            const b1 = -1.5377 * cL1 - 3.6926 * sL1;
            const c1 = 3.6926 * sL1 + 1.5377 * cL1;
            const d1 = -1.5377 * sL1 + 3.6926 * cL1;
            leaf1.setAttribute("transform", `matrix(${a1}, ${b1}, ${c1}, ${d1}, 181.510, 257.075)`);
        }

        if (leaf2) {
            const l2 = swayB2 + Math.sin(time * 0.0024 + 1.0) * -0.06;
            const cL2 = Math.cos(l2); const sL2 = Math.sin(l2);
            leaf2.setAttribute("transform", `matrix(${4 * cL2}, ${4 * sL2}, ${-4 * sL2}, ${4 * cL2}, 458.525, 466.737)`);
        }

        if (leaf3) {
            const l3 = swayB3 + Math.sin(time * 0.003 + 1.6) * 0.09;
            const cL3 = Math.cos(l3); const sL3 = Math.sin(l3);
            const a3 = 3.9890 * cL3 - 0.2962 * sL3;
            const b3 = -0.2962 * cL3 - 3.9890 * sL3;
            const c3 = 3.9890 * sL3 + 0.2962 * cL3;
            const d3 = -0.2962 * sL3 + 3.9890 * cL3;
            leaf3.setAttribute("transform", `matrix(${a3}, ${b3}, ${c3}, ${d3}, 179.624, 477.951)`);
        }

        if (leaf4) {
            const l4 = swayB4 + Math.sin(time * 0.0022 + 2.4) * -0.07;
            const cL4 = Math.cos(l4); const sL4 = Math.sin(l4);
            leaf4.setAttribute("transform", `matrix(${4 * cL4}, ${4 * sL4}, ${-4 * sL4}, ${4 * cL4}, 359.245, 655.233)`);
        }

        if (leaf5) {
            const l5 = swayB1 + Math.sin(time * 0.0026 + 0.8) * 0.08;
            const cL5 = Math.cos(l5); const sL5 = Math.sin(l5);
            const a5 = 3.99999 * cL5 + 0.0076 * sL5;
            const b5 = 0.0076 * cL5 - 3.99999 * sL5;
            const c5 = 3.99999 * sL5 - 0.0076 * cL5;
            const d5 = 0.0076 * sL5 + 3.99999 * cL5;
            leaf5.setAttribute("transform", `matrix(${a5}, ${b5}, ${c5}, ${d5}, 471.264, 249.762)`);
        }

        requestAnimationFrame(animatePlant);
    }

    requestAnimationFrame(animatePlant);
});
/* <=== plant wind sway end ===> */

/* <=== social media swiper start ===> */
document.addEventListener("DOMContentLoaded", () => {
    const swiperElement = document.querySelector(".unitsSwiper");
    if (swiperElement) {
        new Swiper(".unitsSwiper", {
            slidesPerView: 2,
            spaceBetween: 15,
            grabCursor: true,
            loop: true,
            observer: true,
            observeParents: true,
            autoplay: {
                delay: 2500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },
            speed: 600,
            breakpoints: {
                320: {
                    slidesPerView: 1.2,
                },
                768: {
                    slidesPerView: 2.5,
                },
                1024: {
                    slidesPerView: 3.5,
                },
            },
        });
    }
});
/* <=== social media swiper end ===> */

/* <=== grid footer & side bar start ===> */
class FooterGrid {
    constructor(container) {
        this.container = container;
        this.colors = ["#AB54F7", "#0072E3", "#FFB200", "#FF6100", "#00AA3C", "#EA3737"];
        this.targetBoxCount = window.innerWidth < 768 ? 9 : 10;
        this.isMouseDown = false;

        this.init();
        this.events();
    }

    init() {
        this.generateBoxes();
    }

    events() {
        let resizeTimeout;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.targetBoxCount = window.innerWidth < 768 ? 9 : 10;
                this.generateBoxes();
            }, 250);
        });

        window.addEventListener("mousedown", () => {
            this.isMouseDown = true;
        });
        window.addEventListener("mouseup", () => {
            this.isMouseDown = false;
        });

        window.addEventListener("touchstart", () => {
            this.isMouseDown = true;
        }, { passive: true });
        window.addEventListener("touchend", () => {
            this.isMouseDown = false;
        });
    }

    generateBoxes() {
        const grid = this.container.querySelector("#grid");
        if (!grid) return;

        grid.innerHTML = "";
        grid.style.display = "grid";

        const width = grid.clientWidth;
        const height = grid.clientHeight;
        const minDim = Math.min(width, height);
        const boxSize = Math.floor(minDim / this.targetBoxCount);

        const cols = Math.ceil(width / boxSize);
        const rows = Math.ceil(height / boxSize);
        const totalBoxes = cols * rows;

        grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

        const interval = Math.floor(totalBoxes / (this.colors.length + 1));
        const colorIndexes = this.colors.map((color, index) => {
            const midpoint = interval * (index + 1);
            const range = Math.floor(0.25 * interval);
            const randomOffset = Math.floor(Math.random() * (2 * range + 1)) - range;
            return Math.min(Math.max(midpoint + randomOffset, 0), totalBoxes - 1);
        });

        for (let i = 0; i < totalBoxes; i++) {
            const cell = document.createElement("div");

            if (i % cols === 0) {
                cell.style.borderLeft = "none";
            }

            const colorIdx = colorIndexes.indexOf(i);
            if (colorIdx !== -1) {
                cell.style.backgroundColor = this.colors[colorIdx];
            }

            cell.addEventListener("click", () => {
                const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
                cell.style.backgroundColor = randomColor;
            });

            cell.addEventListener("mouseover", () => {
                if (this.isMouseDown) {
                    const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
                    cell.style.backgroundColor = randomColor;
                }
            });

            cell.addEventListener("touchmove", (e) => {
                if (this.isMouseDown) {
                    const touch = e.touches[0];
                    const element = document.elementFromPoint(touch.clientX, touch.clientY);
                    if (element && element.parentNode === grid) {
                        const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
                        element.style.backgroundColor = randomColor;
                    }
                }
            }, { passive: true });

            grid.appendChild(cell);
        }
        this.rotateColors();
    }

    rotateColors() {
        const first = this.colors.shift();
        this.colors.push(first);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const footer = document.querySelector(".footer-main");
    if (footer) {
        new FooterGrid(footer);
    }

    const mainMenu = document.querySelector(".header-main-menu");
    if (mainMenu) {
        const parentLi = mainMenu.querySelector(".menu-item-has-children");
        if (parentLi) {
            const triggerLink = parentLi.querySelector("a");
            const subMenu = parentLi.querySelector(".sub-menu");
            const blocker = parentLi.querySelector(".blocker");
            const backBtn = parentLi.querySelector(".submenu-back-btn");

            const openSubmenu = (e) => {
                e.preventDefault();
                subMenu.classList.add("open");
                triggerLink.setAttribute("aria-current", "page");

                if (window.lenis) {
                    window.lenis.stop();
                }

                const cards = subMenu.querySelectorAll("li:not(.submenu-back-item)");
                gsap.fromTo(cards,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.08 }
                );
            };

            const closeSubmenu = (e) => {
                if (e) e.preventDefault();
                subMenu.classList.remove("open");
                triggerLink.removeAttribute("aria-current");

                if (window.lenis) {
                    window.lenis.start();
                }
            };

            triggerLink.addEventListener("click", (e) => {
                if (subMenu.classList.contains("open")) {
                    closeSubmenu(e);
                } else {
                    openSubmenu(e);
                }
            });

            if (blocker) {
                blocker.addEventListener("click", closeSubmenu);
            }

            if (backBtn) {
                backBtn.addEventListener("click", closeSubmenu);
            }
        }
    }
});
/* <=== grid footer & side bar end ===> */

/* <=== nea banner swiper start ===> */
document.addEventListener("DOMContentLoaded", () => {
    const neaBannerEl = document.querySelector(".neaBannerSwiper");

    if (neaBannerEl) {
        new Swiper(".neaBannerSwiper", {
            effect: "fade",
            fadeEffect: {
                crossFade: true,
            },
            speed: 900,
            loop: true,
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },
        });
    }
});
/* <=== nea banner swiper end ===> */

/* <=== community living spaces swiper start ===> */
document.addEventListener("DOMContentLoaded", () => {
    const bookingWrappers = document.querySelectorAll(".nea_booking-wrapper");
    if (bookingWrappers.length === 0) return;

    bookingWrappers.forEach((wrapper) => {
        const btnContainer = wrapper.querySelector(".nea_booking-wrapper-button");
        const filterMain = wrapper.querySelector(".nea_booking_filter-main");
        const buttons = wrapper.querySelectorAll(".nea_booking-filter-button");
        const tabContents = wrapper.querySelectorAll(".nea_booking-tab-content");

        if (!btnContainer || !filterMain || buttons.length === 0 || tabContents.length === 0) return;

        const swipers = [];

        tabContents.forEach((tab) => {
            const swiperContainer = tab.querySelector('.js-slides-container');
            const nextBtn = tab.querySelector('.js-nextBtn');
            const prevBtn = tab.querySelector('.js-prevBtn');

            if (swiperContainer) {
                const swiperInstance = new Swiper(swiperContainer, {
                    slidesPerView: 1.5,
                    spaceBetween: 20,
                    observer: true,
                    observeParents: true,
                    navigation: {
                        nextEl: nextBtn,
                        prevEl: prevBtn,
                    },
                    breakpoints: {
                        0: {
                            slidesPerView: 1,
                            spaceBetween: 10,
                        },
                        901: {
                            slidesPerView: 1.5,
                            spaceBetween: 20,
                        }
                    }
                });
                swipers.push(swiperInstance);
            } else {
                swipers.push(null);
            }
        });

        function switchTab(index, allowToggle = true) {
            const isCurrentlyActive = buttons[index] && buttons[index].classList.contains("active");

            if (allowToggle && isCurrentlyActive) {
                buttons[index].classList.remove("active");
                tabContents[index].classList.remove("active");
                tabContents[index].style.display = "none";
                return;
            }

            buttons.forEach((btn, idx) => {
                if (idx === index) {
                    btn.classList.add("active");
                } else {
                    btn.classList.remove("active");
                }
            });

            tabContents.forEach((tab, idx) => {
                if (idx === index) {
                    tab.classList.add("active");
                    tab.style.display = "block";
                    if (swipers[idx]) {
                        swipers[idx].update();
                    }
                } else {
                    tab.classList.remove("active");
                    tab.style.display = "none";
                }
            });
        }

        buttons.forEach((btn, index) => {
            btn.addEventListener("click", () => {
                switchTab(index, true);
            });
        });

        let isMobilePlaced = false;

        function checkLayoutPlacement() {
            const isMobile = window.innerWidth <= 1023;

            if (isMobile && !isMobilePlaced) {
                buttons.forEach((btn, idx) => {
                    const tab = tabContents[idx];
                    if (btn && tab) {
                        btn.after(tab);
                    }
                });
                isMobilePlaced = true;
            } else if (!isMobile && isMobilePlaced) {
                tabContents.forEach((tab) => {
                    filterMain.appendChild(tab);
                });
                isMobilePlaced = false;
            }

            tabContents.forEach((tab, idx) => {
                if (tab.classList.contains("active") && swipers[idx]) {
                    swipers[idx].update();
                }
            });
        }

        checkLayoutPlacement();
        window.addEventListener("resize", checkLayoutPlacement);

        wrapper.addEventListener("click", (e) => {
            const upgradeBtn = e.target.closest(".js-nexttab-button");
            if (upgradeBtn) {
                const targetId = parseInt(upgradeBtn.getAttribute("data-id"), 10);
                if (!isNaN(targetId) && targetId >= 0 && targetId < buttons.length) {
                    switchTab(targetId, false);
                    if (buttons[targetId]) {
                        buttons[targetId].scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                }
            }
        });
    });
});
/* <=== community living spaces swiper end ===> */

/* <=== FAQs section dropdown start ===> */
const dropdownButtons = document.querySelectorAll('.js-dropdown-button');

dropdownButtons.forEach(button => {
    const dropdown = button.closest('.faq-dropdown');
    if (!dropdown) return;
    const pane = dropdown.querySelector('.js-pane');
    const icon = button.querySelector('svg');
    if (!pane || !icon) return;

    let isOpen = false;

    button.addEventListener('click', () => {
        isOpen = !isOpen;

        if (isOpen) {
            gsap.to(dropdown, {
                backgroundColor: '#ffffff',
                borderColor: 'transparent',
                duration: 0.4,
                ease: 'power2.out'
            });

            gsap.to(icon, {
                rotate: 45,
                duration: 0.4,
                ease: 'power2.out'
            });

            gsap.set(pane, { height: 'auto' });
            gsap.from(pane, {
                height: 0,
                duration: 0.4,
                ease: 'power2.out'
            });
        } else {
            gsap.to(dropdown, {
                backgroundColor: 'transparent',
                borderColor: '#000000',
                duration: 0.4,
                ease: 'power2.out'
            });

            gsap.to(icon, {
                rotate: 0,
                duration: 0.4,
                ease: 'power2.out'
            });

            gsap.to(pane, {
                height: 0,
                duration: 0.4,
                ease: 'power2.out'
            });
        }
    });
});
/* <=== FAQs section dropdown end ===> */

/* <=== Community Spaces section start ===> */
try {
    const container = document.getElementById('spacesSlidesContainer');
    if (container && typeof gsap !== 'undefined') {
        const slides = document.querySelectorAll('.spaces-slide');
        const eyeCursor = document.getElementById('spacesEyeCursor');

        const lightbox = document.getElementById('spacesLightbox');
        const lightboxImg = document.getElementById('spacesLightboxImg');
        const lightboxClose = document.getElementById('spacesLightboxClose');
        const lightboxPrev = document.getElementById('spacesLightboxPrev');
        const lightboxNext = document.getElementById('spacesLightboxNext');

        let lightboxIndex = 0;

        if (eyeCursor) {
            gsap.set(eyeCursor, { xPercent: -50, yPercent: -50 });
        }

        const xTo = eyeCursor ? gsap.quickTo(eyeCursor, "x", { duration: 0.4, ease: "power2.out" }) : null;
        const yTo = eyeCursor ? gsap.quickTo(eyeCursor, "y", { duration: 0.4, ease: "power2.out" }) : null;

        if (eyeCursor) {
            container.addEventListener('mouseenter', () => {
                gsap.to(eyeCursor, { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' });
            });

            container.addEventListener('mouseleave', () => {
                gsap.to(eyeCursor, { opacity: 0, scale: 0.5, duration: 0.4, ease: 'power2.out' });
            });

            container.addEventListener('mousemove', (e) => {
                const rect = container.getBoundingClientRect();
                if (xTo && yTo) {
                    xTo(e.clientX - rect.left);
                    yTo(e.clientY - rect.top);
                }
            });
        }

        if (typeof Swiper !== 'undefined') {
            new Swiper('#spacesSlidesContainer', {
                slidesPerView: 2,
                spaceBetween: 20,
                navigation: {
                    nextEl: '#spacesNextBtn',
                    prevEl: '#spacesPrevBtn',
                },
                breakpoints: {
                    0: {
                        slidesPerView: 1,
                        spaceBetween: 10,
                    },
                    901: {
                        slidesPerView: 2,
                        spaceBetween: 20,
                    }
                }
            });
        }

        if (slides.length > 0 && lightbox) {
            slides.forEach((slide) => {
                slide.addEventListener('click', () => {
                    const index = parseInt(slide.getAttribute('data-index'));
                    openLightbox(index);
                });
            });
        }

        function openLightbox(index) {
            if (!lightbox || !lightboxImg) return;
            lightboxIndex = index;
            const imgEl = slides[lightboxIndex].querySelector('img');
            if (imgEl) {
                lightboxImg.src = imgEl.src;
            }
            lightbox.classList.add('active');
            updateLightboxButtons();
        }

        function closeLightbox() {
            if (lightbox) {
                lightbox.classList.remove('active');
            }
        }

        function updateLightboxButtons() {
            if (!lightboxPrev || !lightboxNext) return;
            if (lightboxIndex <= 0) {
                lightboxPrev.classList.add('disabled');
            } else {
                lightboxPrev.classList.remove('disabled');
            }

            if (lightboxIndex >= slides.length - 1) {
                lightboxNext.classList.add('disabled');
            } else {
                lightboxNext.classList.remove('disabled');
            }
        }

        if (lightboxPrev) {
            lightboxPrev.addEventListener('click', () => {
                if (lightboxIndex > 0 && slides[lightboxIndex - 1]) {
                    lightboxIndex--;
                    const imgEl = slides[lightboxIndex].querySelector('img');
                    if (imgEl && lightboxImg) {
                        lightboxImg.src = imgEl.src;
                    }
                    updateLightboxButtons();
                }
            });
        }

        if (lightboxNext) {
            lightboxNext.addEventListener('click', () => {
                if (lightboxIndex < slides.length - 1 && slides[lightboxIndex + 1]) {
                    lightboxIndex++;
                    const imgEl = slides[lightboxIndex].querySelector('img');
                    if (imgEl && lightboxImg) {
                        lightboxImg.src = imgEl.src;
                    }
                    updateLightboxButtons();
                }
            });
        }

        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }

        if (lightbox) {
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    closeLightbox();
                }
            });
        }
    }
} catch (e) {
    console.error("Community spaces slider error:", e);
}
/* <=== Community Spaces section end ===> */

/* <=== Features Section start ===> */
const initFeaturesSection = () => {
    const allCols = document.querySelectorAll('.features-col');
    if (allCols.length > 0) {
        allCols.forEach(col => {
            col.addEventListener('mouseenter', () => {
                allCols.forEach(c => c.classList.remove('active'));
                col.classList.add('active');
            });

            col.addEventListener('mouseleave', () => {
                col.classList.remove('active');
            });
        });
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFeaturesSection);
} else {
    initFeaturesSection();
}
/* <=== Features Section end ===> */

/* <=== SVG Movement Animation start ===> */
document.addEventListener('DOMContentLoaded', () => {
    const balls = [
        { id: '#anim-ball-1', duration: 2.4, y: -6, x: 2, rot: 15, delay: 0.1 },
        { id: '#anim-ball-2', duration: 2.8, y: -8, x: -3, rot: -20, delay: 0.4 },
        { id: '#anim-ball-3', duration: 2.1, y: -5, x: 2.5, rot: 25, delay: 0.2 },
        { id: '#anim-ball-4', duration: 3.0, y: -9, x: -2, rot: -15, delay: 0.7 },
        { id: '#anim-ball-5', duration: 2.3, y: -6, x: 3, rot: 18, delay: 0.3 },
        { id: '#anim-ball-6', duration: 2.6, y: -7, x: -2.5, rot: -22, delay: 0.5 },
        { id: '#anim-ball-7', duration: 2.0, y: -5, x: 2, rot: 12, delay: 0.8 },
        { id: '#anim-ball-8', duration: 2.7, y: -8, x: -3, rot: -18, delay: 0.2 },
        { id: '#anim-ball-9', duration: 2.2, y: -6, x: 2.2, rot: 15, delay: 0.6 }
    ];

    balls.forEach(b => {
        if (!document.querySelector(b.id)) return;

        gsap.to(b.id, {
            y: b.y,
            duration: b.duration,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: b.delay
        });

        gsap.to(b.id, {
            x: b.x,
            duration: b.duration * 1.3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: b.delay * 0.5
        });

        gsap.to(b.id, {
            rotation: b.rot,
            transformOrigin: "50% 50%",
            duration: b.duration * 1.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    });

    if (document.querySelector('#anim-straw')) {
        gsap.set('#anim-straw', { transformOrigin: '50% 90%' });

        gsap.to('#anim-straw', {
            rotation: 2.5,
            duration: 2.2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

        gsap.to('#anim-straw', {
            y: -3,
            duration: 1.8,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }

    if (document.querySelector('#anim-string')) {
        gsap.set('#anim-string', { transformOrigin: 'top center' });
        gsap.to('#anim-string', {
            rotation: 8,
            duration: 1.8,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }

    if (document.querySelector('#anim-blue-label')) {
        gsap.set('#anim-blue-label', { transformOrigin: 'top center' });
        gsap.to('#anim-blue-label', {
            rotation: 12,
            duration: 1.8,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: 0.15
        });
    }

    if (document.querySelector('#anim-yellow-tag')) {
        gsap.set('#anim-yellow-tag', { transformOrigin: 'bottom center' });
        gsap.to('#anim-yellow-tag', {
            rotation: -4,
            duration: 1.4,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }

    if (document.querySelector('#anim-cup')) {
        gsap.to('#anim-cup', {
            y: -2,
            duration: 2.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }

    if (document.querySelector('#anim-cup-liquid')) {
        gsap.to('#anim-cup-liquid', {
            scaleY: 1.02,
            transformOrigin: "bottom center",
            duration: 1.6,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }
});
/* <=== SVG Movement Animation end ===> */

/* <=== Contact Page Address Smooth Slide-In start ===> */
document.addEventListener('DOMContentLoaded', () => {
    const addressCard = document.querySelector('.contact-info-address');
    if (addressCard) {
        gsap.from(addressCard, {
            xPercent: 100,
            duration: 1.5,
            ease: "power3.out",
            delay: 0.2
        });
    }
});
/* <=== Contact Page Address Smooth Slide-In end ===> */

/* <=== Contact Page Floating Form Labels start ===> */
document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('.contact-input-wrapper input');

    inputs.forEach(input => {
        const wrapper = input.parentElement;

        if (input.value.trim() !== "") {
            wrapper.classList.add('active');
        }

        input.addEventListener('focus', () => {
            wrapper.classList.add('active');
        });

        input.addEventListener('blur', () => {
            if (input.value.trim() === "") {
                wrapper.classList.remove('active');
            }
        });
    });
});
/* <=== Contact Page Floating Form Labels end ===> */

/* <=== Our Way of Living Gallery Pinned ScrollTrigger start ===> */
document.addEventListener("DOMContentLoaded", function () {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        const pinnedWrapper = document.querySelector('#ourWayPinnedWrapper');
        if (pinnedWrapper) {
            const imgSlides = pinnedWrapper.querySelectorAll('.our-way-img-slide');
            const cardGroups = pinnedWrapper.querySelectorAll('.our-way-card-group');

            gsap.set(imgSlides, { opacity: 0, zIndex: 1, scale: 1.03 });
            gsap.set(imgSlides[0], { opacity: 1, zIndex: 2, scale: 1 });

            gsap.set(cardGroups, { opacity: 0, pointerEvents: 'none' });

            cardGroups.forEach((group, gIdx) => {
                const boxes = group.querySelectorAll('.our-way-info-box');
                if (gIdx === 0) {
                    gsap.set(group, { opacity: 1, pointerEvents: 'auto' });
                    gsap.set(boxes, { opacity: 1, y: 0 });
                } else {
                    gsap.set(boxes, { opacity: 0, y: 50 });
                }
            });

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: pinnedWrapper,
                    start: "top top",
                    end: () => "+=" + (window.innerHeight * 3),
                    pin: true,
                    pinSpacing: true,
                    scrub: 0.8,
                    anticipatePin: 1
                }
            });

            const boxes0 = cardGroups[0] ? cardGroups[0].querySelectorAll('.our-way-info-box') : [];
            const boxes1 = cardGroups[1] ? cardGroups[1].querySelectorAll('.our-way-info-box') : [];
            const boxes2 = cardGroups[2] ? cardGroups[2].querySelectorAll('.our-way-info-box') : [];

            tl.to(boxes0, { opacity: 0, y: -25, duration: 0.4, stagger: 0.1, ease: "power1.inOut" }, 0.7)
                .set(cardGroups[0], { pointerEvents: 'none' }, 1.1)

                .to(imgSlides[0], { opacity: 0, scale: 1.03, duration: 0.8, ease: "power1.inOut" }, 0.9)
                .to(imgSlides[1], { opacity: 1, scale: 1, duration: 0.8, ease: "power1.inOut" }, 0.9)

                .set(cardGroups[1], { opacity: 1, pointerEvents: 'auto' }, 1.2)
                .to(boxes1, { opacity: 1, y: 0, duration: 0.5, stagger: 0.15, ease: "power2.out" }, 1.3);

            tl.to(boxes1, { opacity: 0, y: -25, duration: 0.4, stagger: 0.1, ease: "power1.inOut" }, 2.2)
                .set(cardGroups[1], { pointerEvents: 'none' }, 2.6)

                .to(imgSlides[1], { opacity: 0, scale: 1.03, duration: 0.8, ease: "power1.inOut" }, 2.4)
                .to(imgSlides[2], { opacity: 1, scale: 1, duration: 0.8, ease: "power1.inOut" }, 2.4)

                .set(cardGroups[2], { opacity: 1, pointerEvents: 'auto' }, 2.7)
                .to(boxes2, { opacity: 1, y: 0, duration: 0.5, stagger: 0.15, ease: "power2.out" }, 2.8);

            tl.to({}, { duration: 0.8 });
        }
    }
});
/* <=== Our Way of Living Gallery Pinned ScrollTrigger end ===> */

/* <=== Responsive Mobile Header Navigation Handler start ===> */
document.addEventListener("DOMContentLoaded", function () {
    const header = document.querySelector("header");
    if (!header) return;

    let topBar = header.querySelector(".mobile-header-top-bar");

    if (!topBar) {
        topBar = document.createElement("div");
        topBar.className = "mobile-header-top-bar";

        const originalLogo = header.querySelector(".header-logo");
        if (originalLogo) {
            const logoClone = originalLogo.cloneNode(true);
            logoClone.classList.add("mobile-top-logo");
            topBar.appendChild(logoClone);
        }

        const rightActions = document.createElement("div");
        rightActions.className = "mobile-header-right-actions";

        const bookBtn = document.createElement("a");
        bookBtn.href = "javascript:void(0)";
        bookBtn.className = "mobile-top-book-btn";
        bookBtn.textContent = "Book your Unit";
        bookBtn.addEventListener("click", function (e) {
            if (window.openCustomSidebar) {
                window.openCustomSidebar(e);
            }
        });
        rightActions.appendChild(bookBtn);

        const toggleBtn = document.createElement("button");
        toggleBtn.className = "mobile-nav-toggle";
        toggleBtn.setAttribute("aria-label", "Toggle Navigation Menu");
        toggleBtn.innerHTML = "<span></span><span></span><span></span>";
        rightActions.appendChild(toggleBtn);

        topBar.appendChild(rightActions);

        header.insertBefore(topBar, header.firstChild);
    }

    const toggleBtn = topBar.querySelector(".mobile-nav-toggle");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            header.classList.toggle("menu-open");
        });

        const menuLinks = header.querySelectorAll(".header-main-menu a, .header-footer-actions a");
        menuLinks.forEach(link => {
            link.addEventListener("click", function () {
                if (link.closest(".menu-item-has-children") && (link.classList.contains("card-blue") || link.getAttribute("href") === "#")) {
                    return;
                }
                header.classList.remove("menu-open");
            });
        });
    }

    try {
        const rawPath = window.location.pathname.split("/").pop().toLowerCase();
        const currentPath = (!rawPath || rawPath === "" || rawPath === "index.html") ? "index.html" : rawPath;

        const navLinks = header.querySelectorAll(".header-main-menu a");
        navLinks.forEach(link => {
            const href = link.getAttribute("href");
            if (!href || href === "#" || href.startsWith("javascript")) return;
            const target = href.split("/").pop().toLowerCase();

            if (target === currentPath) {
                link.classList.add("active");
                const parentLi = link.closest(".menu-item-has-children");
                if (parentLi) {
                    const topTrigger = parentLi.querySelector("a.card-blue");
                    if (topTrigger) topTrigger.classList.add("active");
                }
            }
        });
    } catch (err) {
        console.error("Active menu check error:", err);
    }
});
/* <=== Responsive Mobile Header Navigation Handler end ===> */

/* <=== Why It's Different Stacked Cards ScrollTrigger start ===> */
document.addEventListener("DOMContentLoaded", function () {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const whyDiffSection = document.querySelector('#whyDiffSection');
    if (!whyDiffSection) return;

    const cards = whyDiffSection.querySelectorAll('.diff-stack-card');
    if (cards.length === 0) return;

    const progressNumber = whyDiffSection.querySelector('.diff-progress-text');
    const progressBar = whyDiffSection.querySelector('.diff-progress-bar');
    const circumference = 2 * Math.PI * 19;
    const totalCards = cards.length;
    const stackStep = window.innerWidth < 768 ? 16 : 28;

    const allCardChars = Array.from(cards).map(card => {
        const titleEl = card.querySelector('.js-diff-split-text');
        if (!titleEl) return [];

        const words = titleEl.textContent.trim().split(/\s+/);
        titleEl.innerHTML = words.map(w =>
            `<span class="diff-word">${[...w].map(c => `<span class="diff-char" style="opacity: 0.22;">${c}</span>`).join('')}</span>`
        ).join(' ');

        return titleEl.querySelectorAll('.diff-char');
    });

    cards.forEach((card, i) => {
        gsap.set(card, { zIndex: i + 1, yPercent: i === 0 ? 0 : 100 });
    });

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: whyDiffSection,
            start: "top top",
            end: () => `+=${window.innerHeight * totalCards * 1.2}`,
            pin: true,
            pinSpacing: true,
            scrub: 0.8,
            anticipatePin: 1,
            onUpdate: (self) => {
                const p = self.progress;
                const activeIndex = p >= 0.999 ? totalCards : Math.min(Math.floor(p * totalCards) + 1, totalCards);

                if (progressNumber) {
                    progressNumber.textContent = String(activeIndex).padStart(2, '0');
                }
                if (progressBar) {
                    progressBar.style.strokeDashoffset = circumference * (1 - p);
                }
            }
        }
    });

    cards.forEach((card, i) => {
        const startTime = i;

        if (i > 0) {
            tl.to(card, {
                yPercent: 0,
                y: stackStep * i,
                duration: 1,
                ease: "power1.inOut"
            }, startTime);
        }

        if (allCardChars[i] && allCardChars[i].length > 0) {
            tl.to(allCardChars[i], {
                opacity: 1,
                stagger: 0.02,
                duration: 0.7,
                ease: "power1.out"
            }, startTime + (i === 0 ? 0.1 : 0.3));
        }
    });
});
/* <=== Why It's Different Stacked Cards ScrollTrigger end ===> */

/* <=== Mobile Living Section Swiper start ===> */
document.addEventListener("DOMContentLoaded", () => {
    const swiperEl = document.querySelector(".levingMobileSwiper");
    if (swiperEl) {
        new Swiper(".levingMobileSwiper", {
            slidesPerView: 1,
            spaceBetween: 16,
            loop: false,
            speed: 500,
            navigation: {
                nextEl: ".levingMobileSwiper .leving-swiper-next",
                prevEl: ".levingMobileSwiper .leving-swiper-prev"
            }
        });
    }
});
/* <=== Mobile Living Section Swiper end ===> */

/* <=== Custom Sidebar (Book your Unit) start ===> */
function openCustomSidebar(e) {
    if (e && typeof e.preventDefault === "function") {
        e.preventDefault();
        e.stopPropagation();
    }
    const sidebar = document.getElementById("customSidebar");
    const backdrop = document.getElementById("customSidebarBackdrop");
    const panel = document.getElementById("customSidebarPanel");

    if (!sidebar || !panel) return;

    sidebar.classList.add("open");
    sidebar.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    if (typeof gsap !== "undefined") {
        gsap.killTweensOf([backdrop, panel]);
        gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" });
        gsap.fromTo(panel, { x: "100%" }, { x: "0%", duration: 0.5, ease: "power3.out" });

        const formElements = panel.querySelectorAll(".custom-sidebar-top-banner, .sidebar-form-section, .sidebar-btn-container");
        if (formElements.length > 0) {
            gsap.fromTo(formElements, { y: 18, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.4, delay: 0.15, ease: "power2.out" });
        }
    }
}

function closeCustomSidebar(e) {
    if (e && typeof e.preventDefault === "function") {
        e.preventDefault();
        e.stopPropagation();
    }
    const sidebar = document.getElementById("customSidebar");
    const backdrop = document.getElementById("customSidebarBackdrop");
    const panel = document.getElementById("customSidebarPanel");

    if (!sidebar || !panel) return;

    if (typeof gsap !== "undefined") {
        gsap.killTweensOf([backdrop, panel]);
        gsap.to(panel, {
            x: "100%",
            duration: 0.4,
            ease: "power3.in"
        });
        gsap.to(backdrop, {
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                sidebar.classList.remove("open");
                sidebar.setAttribute("aria-hidden", "true");
                document.body.style.overflow = "";
            }
        });
    } else {
        sidebar.classList.remove("open");
        sidebar.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }
}

window.openCustomSidebar = openCustomSidebar;
window.closeCustomSidebar = closeCustomSidebar;

function initSidebarEvents() {
    const directTriggers = document.querySelectorAll(".card-book, #headerBookBtn, .card-purple.card-book, [data-open-sidebar]");
    directTriggers.forEach(btn => {
        btn.addEventListener("click", (e) => {
            openCustomSidebar(e);
        });
    });

    document.addEventListener("click", (e) => {
        const trigger = e.target.closest("a, button, .card-book");
        if (trigger) {
            if (trigger.closest("#customSidebarPanel")) return;
            const text = (trigger.textContent || "").trim().toLowerCase();
            if (
                text.includes("book your unit") ||
                text.includes("book your pixal") ||
                trigger.classList.contains("card-book") ||
                trigger.id === "headerBookBtn" ||
                trigger.hasAttribute("data-open-sidebar")
            ) {
                openCustomSidebar(e);
            }
        }
    }, true);

    const closeBtn = document.getElementById("customSidebarClose");
    if (closeBtn) {
        closeBtn.addEventListener("click", (e) => {
            closeCustomSidebar(e);
        });
    }

    const backdrop = document.getElementById("customSidebarBackdrop");
    if (backdrop) {
        backdrop.addEventListener("click", (e) => {
            closeCustomSidebar(e);
        });
    }

    document.addEventListener("keydown", (e) => {
        const sidebar = document.getElementById("customSidebar");
        if (e.key === "Escape" && sidebar && sidebar.classList.contains("open")) {
            closeCustomSidebar(e);
        }
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSidebarEvents);
} else {
    initSidebarEvents();
}
/* <=== Custom Sidebar (Book your Unit) end ===> */

/* <=== FAQs Page Category Navigation & Scroll Tracking start ===> */
function initFaqCategoryNav() {
    const faqFilterButtons = document.querySelectorAll('.faqs-items-list .faqs-item');
    const faqSections = document.querySelectorAll('.faqs-group-section');

    if (faqFilterButtons.length === 0 || faqSections.length === 0) return;

    // Helper to get matching section for a button
    function getSectionForButton(btn, index) {
        const targetId = btn.getAttribute('data-target');
        if (targetId) {
            const el = document.getElementById(targetId);
            if (el) return el;
        }

        const text = (btn.textContent || '').trim().toLowerCase();
        if (text.includes('about')) return document.getElementById('faq-about') || faqSections[0];
        if (text.includes('buying')) return document.getElementById('faq-buying') || faqSections[1];
        if (text.includes('selling')) return document.getElementById('faq-selling') || faqSections[2];
        if (text.includes('rental')) return document.getElementById('faq-rental') || faqSections[3];
        if (text.includes('managing')) return document.getElementById('faq-managing') || faqSections[4];
        if (text.includes('payment') || text.includes('prices')) return document.getElementById('faq-payment') || faqSections[5];
        if (text.includes('other')) return document.getElementById('faq-other') || faqSections[6];
        if (text.includes('contact')) return document.getElementById('faq-contact') || faqSections[7];

        return faqSections[index] || null;
    }

    // Click to smooth scroll to section
    faqFilterButtons.forEach((btn, idx) => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const targetEl = getSectionForButton(this, idx);

            if (targetEl) {
                const topOffset = window.innerWidth <= 1023 ? 90 : 30;
                const elementTop = targetEl.getBoundingClientRect().top + window.pageYOffset - topOffset;

                window.scrollTo({
                    top: elementTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFaqCategoryNav);
} else {
    initFaqCategoryNav();
}
/* <=== FAQs Page Category Navigation & Scroll Tracking end ===> */