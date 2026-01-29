import Phaser from 'phaser';

export enum TutorialStep {
    WELCOME = 'WELCOME',
    MOVEMENT = 'MOVEMENT',
    COLLECT_CHOCOLATE = 'COLLECT_CHOCOLATE',
    AVOID_OBSTACLES = 'AVOID_OBSTACLES',
    POWER_UPS = 'POWER_UPS',
    GADGETS = 'GADGETS',
    BIOMES = 'BIOMES',
    BOSS_FIGHT = 'BOSS_FIGHT',
    COMPLETE = 'COMPLETE'
}

interface TutorialStepData {
    step: TutorialStep;
    title: string;
    description: string;
    objective: string;
    condition: (scene: Phaser.Scene) => boolean;
    skipable: boolean;
}

export class TutorialSystem {
    private scene: Phaser.Scene;
    private currentStep: TutorialStep = TutorialStep.WELCOME;
    private isActive: boolean = false;
    private stepData: Map<TutorialStep, TutorialStepData>;
    private completedSteps: Set<TutorialStep> = new Set();

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.stepData = this.initializeSteps();
    }

    private initializeSteps(): Map<TutorialStep, TutorialStepData> {
        const steps = new Map<TutorialStep, TutorialStepData>();

        steps.set(TutorialStep.WELCOME, {
            step: TutorialStep.WELCOME,
            title: 'Welcome to SnakeCraft!',
            description: 'You are a snake exploring a dangerous world. Your goal is to grow, survive, and defeat powerful bosses!',
            objective: 'Click anywhere to continue',
            condition: () => true,
            skipable: false
        });

        steps.set(TutorialStep.MOVEMENT, {
            step: TutorialStep.MOVEMENT,
            title: 'Movement',
            description: 'Use WASD or Arrow Keys to move your snake. On mobile, use the joystick on the right side of the screen.',
            objective: 'Move in all 4 directions',
            condition: (scene) => {
                const registry = scene.game.registry;
                const movedUp = registry.get('tutorial_moved_up') || false;
                const movedDown = registry.get('tutorial_moved_down') || false;
                const movedLeft = registry.get('tutorial_moved_left') || false;
                const movedRight = registry.get('tutorial_moved_right') || false;
                return movedUp && movedDown && movedLeft && movedRight;
            },
            skipable: true
        });

        steps.set(TutorialStep.COLLECT_CHOCOLATE, {
            step: TutorialStep.COLLECT_CHOCOLATE,
            title: 'Collect Chocolate',
            description: 'Brown blocks are chocolate! Collect them to grow your snake and earn points. The more you eat, the faster you move!',
            objective: 'Collect 5 chocolate blocks',
            condition: (scene) => {
                const collected = scene.game.registry.get('tutorial_chocolate_collected') || 0;
                return collected >= 5;
            },
            skipable: true
        });

        steps.set(TutorialStep.AVOID_OBSTACLES, {
            step: TutorialStep.AVOID_OBSTACLES,
            title: 'Avoid Obstacles',
            description: 'Gray blocks are stone (damage), black blocks are bedrock (instant death). Red blocks are lava (high damage). Avoid them!',
            objective: 'Survive for 30 seconds',
            condition: (scene) => {
                const startTime = scene.game.registry.get('tutorial_obstacle_start') || Date.now();
                return Date.now() - startTime > 30000;
            },
            skipable: true
        });

        steps.set(TutorialStep.POWER_UPS, {
            step: TutorialStep.POWER_UPS,
            title: 'Power-Ups',
            description: 'Purple boxes contain power-ups! They activate automatically and give you temporary abilities like speed boost, shield, or laser eyes.',
            objective: 'Collect 1 power-up',
            condition: (scene) => {
                const collected = scene.game.registry.get('tutorial_powerup_collected') || 0;
                return collected >= 1;
            },
            skipable: true
        });

        steps.set(TutorialStep.GADGETS, {
            step: TutorialStep.GADGETS,
            title: 'Gadgets',
            description: 'Gadgets are purchased in the shop and activated manually. Press SPACE (or tap the gadget button) to use them. They have cooldowns!',
            objective: 'Press SPACE to continue',
            condition: (scene) => {
                const pressed = scene.game.registry.get('tutorial_gadget_pressed') || false;
                return pressed;
            },
            skipable: true
        });

        steps.set(TutorialStep.BIOMES, {
            step: TutorialStep.BIOMES,
            title: 'Biomes',
            description: 'The world has different biomes: Grassland (safe), Desert (heat damage), Tundra (cold slows you), Obsidian Waste (toxic damage).',
            objective: 'Explore different biomes',
            condition: (scene) => {
                const biomesVisited = scene.game.registry.get('tutorial_biomes_visited') || new Set();
                return biomesVisited.size >= 2;
            },
            skipable: true
        });

        steps.set(TutorialStep.BOSS_FIGHT, {
            step: TutorialStep.BOSS_FIGHT,
            title: 'Boss Fight',
            description: 'When you reach enough points, a boss will spawn! Defeat it to advance to the next level. Use your laser eyes to damage bosses!',
            objective: 'Reach 500 points to spawn a boss',
            condition: (scene) => {
                const score = scene.game.registry.get('tutorial_score') || 0;
                return score >= 500;
            },
            skipable: true
        });

        steps.set(TutorialStep.COMPLETE, {
            step: TutorialStep.COMPLETE,
            title: 'Tutorial Complete!',
            description: 'You are ready to play! Remember: collect chocolate, avoid obstacles, use power-ups and gadgets wisely, and defeat bosses to progress!',
            objective: 'Start playing!',
            condition: () => true,
            skipable: false
        });

        return steps;
    }

    public start() {
        this.isActive = true;
        this.currentStep = TutorialStep.WELCOME;
        this.completedSteps.clear();
        this.scene.game.registry.set('tutorial_obstacle_start', Date.now());
        this.emitStepUpdate();
    }

    public skip() {
        const stepData = this.stepData.get(this.currentStep);
        if (stepData?.skipable) {
            this.complete();
        }
    }

    public complete() {
        this.isActive = false;
        this.currentStep = TutorialStep.COMPLETE;
        this.scene.game.events.emit('tutorialComplete');
    }

    public update() {
        if (!this.isActive) return;

        const stepData = this.stepData.get(this.currentStep);
        if (!stepData) return;

        // Check if current step is completed
        if (stepData.condition(this.scene)) {
            this.completeStep();
        }
    }

    private completeStep() {
        this.completedSteps.add(this.currentStep);

        // Move to next step
        const steps = Array.from(this.stepData.keys());
        const currentIndex = steps.indexOf(this.currentStep);
        
        if (currentIndex < steps.length - 1) {
            this.currentStep = steps[currentIndex + 1];
            this.emitStepUpdate();
        } else {
            this.complete();
        }
    }

    private emitStepUpdate() {
        const stepData = this.stepData.get(this.currentStep);
        if (stepData) {
            this.scene.game.events.emit('tutorialStepUpdate', {
                step: stepData.step,
                title: stepData.title,
                description: stepData.description,
                objective: stepData.objective,
                skipable: stepData.skipable,
                progress: this.completedSteps.size,
                total: this.stepData.size
            });
        }
    }

    public getCurrentStep(): TutorialStep {
        return this.currentStep;
    }

    public isStepComplete(step: TutorialStep): boolean {
        return this.completedSteps.has(step);
    }

    public getProgress(): { completed: number; total: number } {
        return {
            completed: this.completedSteps.size,
            total: this.stepData.size
        };
    }

    public isRunning(): boolean {
        return this.isActive;
    }
}
