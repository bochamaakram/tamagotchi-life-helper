class Pet {
    constructor(store) {
        this.store = store;
        this.stats = this.store.get('petStats') || {
            health: 100,
            happiness: 100,
            energy: 100,
            health: 100,
            happiness: 100,
            energy: 100,
            health: 100,
            happiness: 100,
            energy: 100,
            hydration: 100
        };
        this.isWorking = false;
        this.isSleeping = false;
        this.levelInfo = this.store.get('petLevel') || {
            level: 1,
            xp: 0,
            maxXp: 100,
            maxXp: 100,
            coins: 0
        };
        this.createdAt = this.store.get('petCreatedAt') || Date.now();
        if (!this.store.get('petCreatedAt')) this.store.set('petCreatedAt', this.createdAt);

        this.decayInterval = null;
    }

    startDecay() {
        if (this.decayInterval) clearInterval(this.decayInterval);
        this.decayInterval = setInterval(() => {
            this.stats.hydration = Math.max(0, this.stats.hydration - 5);
            this.stats.energy = Math.max(0, this.stats.energy - 2);
            this.stats.happiness = Math.max(0, this.stats.happiness - 3);

            // Health drops if other stats are critical
            if (this.stats.hydration === 0 || this.stats.energy === 0) {
                this.stats.health = Math.max(0, this.stats.health - 5);
            }

            this.save();
        }, 1000 * 60 * 60); // Decay every hour (can speed up for testing)

        // Save initial state
        this.save();
    }

    feed() {
        this.stats.health = Math.min(100, this.stats.health + 10);
        this.stats.happiness = Math.min(100, this.stats.happiness + 5);
        this.save();
    }

    drink() {
        this.stats.hydration = Math.min(100, this.stats.hydration + 20);
        this.save();
    }

    sleep() {
        this.stats.energy = 100;
        this.save();
    }

    play() {
        this.stats.happiness = Math.min(100, this.stats.happiness + 15);
        this.stats.energy = Math.max(0, this.stats.energy - 10);
        this.save();
    }

    toggleWork() {
        this.isWorking = !this.isWorking;
        if (this.isWorking) this.isSleeping = false; // Wake up if working
        return this.isWorking;
    }

    toggleSleep() {
        this.isSleeping = !this.isSleeping;
        if (this.isSleeping) this.isWorking = false; // Stop working if sleeping
        return this.isSleeping;
    }

    sleep() {
        // Legacy method, maybe just boost energy now?
        this.stats.energy = 100;
        this.save();
    }

    addXp(amount) {
        this.levelInfo.xp += amount;
        if (this.levelInfo.xp >= this.levelInfo.maxXp) {
            this.levelInfo.level++;
            this.levelInfo.xp -= this.levelInfo.maxXp;
            this.levelInfo.maxXp = Math.floor(this.levelInfo.maxXp * 1.5);
            // Level up reward
            this.addCoins(50);
        }
        this.save();
        return this.levelInfo;
    }

    addCoins(amount) {
        this.levelInfo.coins = (this.levelInfo.coins || 0) + amount;
        this.save();
    }

    spendCoins(amount) {
        if (this.levelInfo.coins >= amount) {
            this.levelInfo.coins -= amount;
            this.save();
            return true;
        }
        return false;
    }

    getAge() {
        const diff = Date.now() - this.createdAt;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        return days;
    }

    getstatus() {
        // Determine visual state based on stats
        if (this.stats.health < 30) return 'sick';
        if (this.isSleeping) return 'sleeping'; // Explicit sleep toggle
        if (this.stats.energy < 30) return 'sleeping'; // Auto sleep if too tired
        if (this.isWorking) return 'working';
        if (this.stats.hydration < 30) return 'thirsty';
        if (this.stats.happiness < 30) return 'sad';
        return 'happy';
    }

    save() {
        this.store.set('petStats', this.stats);
        this.store.set('petLevel', this.levelInfo);
    }
}

module.exports = Pet;
