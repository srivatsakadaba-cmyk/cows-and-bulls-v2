import React, { useRef, useEffect, useState } from 'react';

const InteractiveParticleTypography = ({
    text = "COWS & BULLS",
    fontSize = 80,
    textColor = 'white'
}) => {
    const canvasRef = useRef(null);
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    // Track mouse position
    const mouse = useRef({ x: null, y: null, radius: 100 });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        // Set canvas dimensions to handle high DPI displays nicely if needed, 
        // but for particles simple pixel mapping is often easier.
        canvas.width = windowSize.width;
        canvas.height = 300; // Fixed height for the banner area

        // Particle Class
        class Particle {
            constructor(x, y, color) {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.originX = x;
                this.originY = y;
                this.color = color;
                this.size = 2; // Particle size
                this.vx = 0;
                this.vy = 0;
                this.friction = 0.95;
                this.ease = 0.15;
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }

            update() {
                // Distance from mouse
                const dx = mouse.current.x - this.x;
                const dy = mouse.current.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Interaction force
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const maxDistance = mouse.current.radius;
                const force = (maxDistance - distance) / maxDistance;
                const directionX = forceDirectionX * force * 5; // Strength
                const directionY = forceDirectionY * force * 5;

                // If mouse is close, push away
                if (distance < mouse.current.radius && mouse.current.x !== null) {
                    this.vx -= directionX;
                    this.vy -= directionY;
                } else {
                    // Return to origin
                    if (this.x !== this.originX) {
                        const tempDx = this.originX - this.x;
                        this.vx += tempDx * 0.05; // Return speed
                    }
                    if (this.y !== this.originY) {
                        const tempDy = this.originY - this.y;
                        this.vy += tempDy * 0.05;
                    }
                }

                // Apply physics
                this.vx *= this.friction;
                this.vy *= this.friction;
                this.x += this.vx;
                this.y += this.vy;

                this.draw();
            }
        }

        let particlesArray = [];
        let animationFrameId;

        const init = () => {
            particlesArray = [];
            // Draw text to an offscreen/temp context to scan pixels? 
            // Actually we can just draw to main canvas, read data, then clear.

            // Configure Text
            // Use a responsive font size based on screen width
            const responsiveFontSize = Math.min(windowSize.width / 8, fontSize);

            ctx.fillStyle = 'white';
            ctx.font = `900 ${responsiveFontSize}px "Inter", sans-serif`; // Use a thick font
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Draw text centered
            ctx.fillText(text, canvas.width / 2, canvas.height / 2);

            // Scan Pixels
            // Optimized: Scan with gap
            const gap = 3; // Gap between particles (lower = more details, slower)
            const textCoordinates = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // Clear canvas after reading
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let y = 0, y2 = textCoordinates.height; y < y2; y += gap) {
                for (let x = 0, x2 = textCoordinates.width; x < x2; x += gap) {
                    // Check alpha value (4th byte)
                    // Index = (y * width + x) * 4 + 3
                    if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
                        // Create particle
                        // Fun gradient coloring based on X position to match the theme (Blue to Purple)
                        // Approx range: Center - 200 to Center + 200 ?
                        // Let's normalize X relative to canvas width for a gradient
                        const px = x / canvas.width;
                        // blue-400 (#60a5fa) to purple-400 (#c084fc)
                        // Simple interpolation or just HSL
                        // Blue is ~210 deg, Purple is ~270 deg.
                        const hue = 200 + (px * 100); // 200 to 300 range approx
                        const color = `hsl(${hue}, 80%, 60%)`;

                        particlesArray.push(new Particle(x, y, color));
                    }
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        init();
        animate();

        // Handle mouse move on the canvas container (or window)
        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.current.x = e.clientX - rect.left;
            mouse.current.y = e.clientY - rect.top;
        };

        // Also handle touch for mobile
        const handleTouchMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            mouse.current.x = touch.clientX - rect.left;
            mouse.current.y = touch.clientY - rect.top;
        }

        const handleLeave = () => {
            mouse.current.x = null;
            mouse.current.y = null;
        }

        // Attach listeners to canvas
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('touchmove', handleTouchMove);
        canvas.addEventListener('mouseleave', handleLeave);
        canvas.addEventListener('touchend', handleLeave);

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('touchmove', handleTouchMove);
            canvas.removeEventListener('mouseleave', handleLeave);
            canvas.removeEventListener('touchend', handleLeave);
        };
    }, [text, windowSize]);

    return (
        <div className="w-full flex justify-center items-center overflow-hidden">
            <canvas
                ref={canvasRef}
                className="cursor-pointer" // signal interactivity
                style={{ width: '100%', height: '300px' }}
            />
        </div>
    );
};

export default InteractiveParticleTypography;
