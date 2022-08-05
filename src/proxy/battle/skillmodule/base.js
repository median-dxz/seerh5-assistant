class NameMatched {
    skillNames = [];
    constructor(names) {
        this.skillNames = names;
    }
    match(skills) {
        for (let skill of skills) {
            let i = this.skillNames.indexOf(skill.name);
            if (i > -1) {
                return skill.id;
            }
        }
    }
}

class DiedSwitchLinked {
    petNames = [];
    constructor(names) {
        this.petNames = names;
    }
    match(pets, dyingCt) {
        let swName = "";
        for (let pet of pets) {
            if (pet.catchTime == dyingCt) {
                swName = pet.name;
                break;
            }
        }
        if (!this.petNames.includes(swName)) return -1;
        swName = this.petNames[this.petNames.indexOf(swName) + 1];
        for (let pet of pets) {
            if (pet.name == swName) {
                if (pet.hp == 0) {
                    return -1;
                } else {
                    return pet.index;
                }
            }
        }
        return -1;
    }
}

export { DiedSwitchLinked, NameMatched };
