import { AspectRatio } from '@chub-ai/stages-ts';
import { buildPromptSegment, SkitType } from './Skit';
import { SaveType, Stage } from "./Stage";
import Actor from './actors/Actor';
import Faction from './factions/Faction';
import { ScreenType } from './screens/BaseScreen';
import { Build, Hotel, Restaurant, Security, AttachMoney, Favorite } from '@mui/icons-material';

export type ModuleType = 'echo chamber' | 'comms' | 'generator' | 'quarters' | 'commons' | 'infirmary' | 'gym' | 'lounge' | 'armory' 
    | 'cryo bank' | 'aperture' | 'director module'
    
    | string; // Allow string for modded modules

export enum StationStat {
    INFRASTRUCTURE = 'Infrastructure',
    COMFORT = 'Comfort',
    PROVISION = 'Provision',
    SECURITY = 'Security',
    HARMONY = 'Harmony',
    WEALTH = 'Wealth'
}

// Icon mapping for station stats
export const STATION_STAT_ICONS: Record<StationStat, any> = {
    [StationStat.INFRASTRUCTURE]: Build,
    [StationStat.COMFORT]: Hotel,
    [StationStat.PROVISION]: Restaurant,
    [StationStat.SECURITY]: Security,
    [StationStat.HARMONY]: Favorite,
    [StationStat.WEALTH]: AttachMoney,
};

export const STATION_STAT_DESCRIPTIONS: Record<StationStat, string> = {
    'Infrastructure': 'The overall condition of the town, its utilities, and its public works',
    'Comfort': 'Overall comfort and livability for residents',
    'Provision': 'Availability of food, water, and essential supplies',
    'Security': 'Safety and defense against external and internal threats',
    'Harmony': 'Social cohesion and morale among inhabitants',
    'Wealth': 'Financial resources of the town and its Founder'
};

export function getStatRating(score: number): StatRating {
    if (score <= 2) {
        return StatRating.POOR;
    } else if (score <= 4) {
        return StatRating.BELOW_AVERAGE;
    } else if (score <= 6) {
        return StatRating.AVERAGE;
    } else if (score <= 8) {
        return StatRating.GOOD;
    } else {
        return StatRating.EXCELLENT;
    }
}

// Mapping of StationStat to a set of prompt additions based on the 1-10 rating of the stat
// 5 ratings: 1-2 (poor), 3-4 (below average), 5-6 (average), 7-8 (good), 9-10 (excellent)
export enum StatRating {
    POOR = 'poor',
    BELOW_AVERAGE = 'below average',
    AVERAGE = 'average',
    GOOD = 'good',
    EXCELLENT = 'excellent'
}
export const STATION_STAT_PROMPTS: Record<StationStat, Record<StatRating, string>> = {
    'Infrastructure': {
        [StatRating.POOR]: 'The town is plagued by outages, potholes, and balky plumbing, its infrastructure barely functional.',
        [StatRating.BELOW_AVERAGE]: 'The town suffers occasional outages, leaks, and minor maintenance concerns that need attention.',
        [StatRating.AVERAGE]: 'The town is generally functional, with routine upkeep keeping its utilities working, if finicky.',
        [StatRating.GOOD]: 'The town runs smoothly, its utilities well-tended and its streets and buildings sound.',
        [StatRating.EXCELLENT]: 'The town hums along on impeccable utilities and well-kept works, operating flawlessly.'
    },
    'Comfort': {
        [StatRating.POOR]: 'Living conditions are harsh, filthy, and downright unhealthy, leading to widespread dissatisfaction among inhabitants.',
        [StatRating.BELOW_AVERAGE]: 'Living conditions are subpar, messy, and unpleasant, with many inhabitants feeling uneasy in their environment.',
        [StatRating.AVERAGE]: 'Living conditions and cleanliness are acceptable, providing a basic level of comfort for inhabitants.',
        [StatRating.GOOD]: 'The town offers a comfortable, clean, and pleasant living environment for its residents.',
        [StatRating.EXCELLENT]: 'Inhabitants enjoy luxurious, impeccable, and healthful living conditions, enhancing their overall well-being.'
    },
    'Provision': {
        [StatRating.POOR]: 'Essential supplies are scarce, leading to frequent shortages and hardships for inhabitants.',
        [StatRating.BELOW_AVERAGE]: 'Provision levels are inconsistent, with occasional shortages of food, water, and supplies.',
        [StatRating.AVERAGE]: 'The town maintains a steady supply of essentials, meeting the basic needs of residents.',
        [StatRating.GOOD]: 'Provision levels are reliable, ensuring inhabitants have access to necessary supplies without issue.',
        [StatRating.EXCELLENT]: 'The town is abundantly stocked with essentials, providing more than enough for all residents.'
    },
    'Security': {
        [StatRating.POOR]: 'The town is vulnerable to trouble, its wards thin and its watch stretched, with frequent security concerns.',
        [StatRating.BELOW_AVERAGE]: 'Security measures are weak, leading to occasional malfeasance and safety concerns among inhabitants.',
        [StatRating.AVERAGE]: 'The town keeps standard wards and watch routines in place; residents may occasionally act out but are generally kept in check.',
        [StatRating.GOOD]: 'Security is robust, the wards and watch effectively protecting the town and its residents from trouble.',
        [StatRating.EXCELLENT]: 'The town is kept safe by well-laid wards and a vigilant watch, ensuring unparalleled safety and protection for all.'
    },
    'Harmony': {
        [StatRating.POOR]: 'Social tensions run high and morale is non-existent, leading to frequent conflicts and a toxic atmosphere among inhabitants.',
        [StatRating.BELOW_AVERAGE]: 'Harmony is lacking and morale is low, with noticeable divisions and occasional disputes among inhabitants.',
        [StatRating.AVERAGE]: 'The social environment is stable, with decent morale and generally peaceful coexistence.',
        [StatRating.GOOD]: 'A strong sense of community and high morale prevails, fostering good vibes and positive relationships among inhabitants.',
        [StatRating.EXCELLENT]: 'Inhabitants enjoy a harmonious and supportive social environment, thriving together in unity.'
    },
    'Wealth': { // Wealth is financial resources of the town and its Founder and does not necessarily reflect the personal wealth of inhabitants nor the town's overall provision levels
        [StatRating.POOR]: 'Financial resources are critically low, potentially leading to severe budget cuts and creditor threats.',
        [StatRating.BELOW_AVERAGE]: 'Wealth levels are low, leading to budget constraints and creditor complaints.',
        [StatRating.AVERAGE]: 'The Founder maintains a stable financial footing, covering operational costs and bills.',
        [StatRating.GOOD]: 'The Founder is financially healthy, with ample resources in reserve.',
        [StatRating.EXCELLENT]: 'The Founder enjoys significant wealth, capable of lavish spending.'
    }
};

export interface ModuleIntrinsic {
    name: string;
    skitPrompt?: string; // Additional prompt text to influence the script in skit generation
    imagePrompt?: string; // Additional prompt text to describe the module in decor image generation
    role?: string;
    roleDescription?: string;
    baseImageUrl: string; // Base image that is used for theming through image2image calls
    defaultImageUrl: string; // Default themed version of the module
    cost: {[key in StationStat]?: number}; // Cost to build the module (StationStat name to amount)
    [key: string]: any; // Additional properties, if needed
    // Action method; each module has an action that will need to take the Module and Stage as contextual parameters:
    action?: (module: Module, stage: Stage, setScreenType: (type: ScreenType) => void) => void;
    available?: (stage: Stage) => boolean;
}

const randomAction = (module: Module, stage: Stage, setScreenType: (type: ScreenType) => void) => {
    // Maybe move the module's owner (if any) here (make sure they aren't located at a faction):
    const owner = module.ownerId ? stage.getSave().actors[module.ownerId] : undefined;
    if (owner && !owner.isOffSite(stage.getSave()) && Math.random() < 0.5) {
        owner.locationId = module.id;
    }

    stage.setSkit({
        type: SkitType.RANDOM_ENCOUNTER,
        moduleId: module.id,
        script: [],
        generating: true,
        context: {},
    });
    setScreenType(ScreenType.SKIT);
};

export const MODULE_TEMPLATES: Record<ModuleType, ModuleIntrinsic> = {
    'echo chamber': {
        name: 'Arrivals Hall',
        skitPrompt: `The Arrivals Hall is where approved applicants first step into town, fresh from whatever world their wish was heard in. Scenes in this room typically involve newcomers getting their bearings and taking their first look at their new life.`,
        imagePrompt: `A bright small-town welcome hall with a polished front desk, a wall of cubby mailboxes and spare keys on hooks, potted plants, and wide doors standing open toward the town square.`,
        role: 'Greeter',
        roleDescription: `Manage the town's day-to-day arrivals, welcoming newcomers and looking after residents' needs as the Founder's right hand.`,
        baseImageUrl: 'https://media.charhub.io/b2bdaa4d-1d35-4640-aceb-811adecd6390/d2721c48-ae91-4c6b-840e-5fd744b05ffb.png',
        defaultImageUrl: 'https://media.charhub.io/b2bdaa4d-1d35-4640-aceb-811adecd6390/d2721c48-ae91-4c6b-840e-5fd744b05ffb.png',
        cost: {}, // Free; starter module
        action: (module: Module, stage: Stage, setScreenType: (type: ScreenType) => void) => {
            // Open the station management screen
            console.log("Opening echo screen from command module.");
            // Use Stage API so any mounted UI can react to the change
            setScreenType(ScreenType.ECHO);
        },
        available: (stage: Stage) => {
            // Can have only one in stage.getSave().layout:
            return stage.getLayout().getModulesWhere(m => m.type === 'echo chamber').length === 0;
        }
    },
    comms: {
        name: 'Meeting Hall',
        skitPrompt: `The Meeting Hall is where the town receives the wider Crossroads: representatives from neighboring towns, guilds, and larger polities visit to arrange trade, work placements, and deals with the Founder. ` +
            `Scenes here often involve arrivals and departures, negotiations, messages carried by visiting envoys, or coordinating comings and goings among the residents.`,
        imagePrompt: `A welcoming town meeting hall with a long wooden conference table, comfortable chairs, maps of the surrounding region pinned to the walls, a coffee sideboard, and a modest waiting area to one side.`,
        role: 'Herald',
        roleDescription: `Oversee the Meeting Hall and its comings and goings, receiving visiting representatives and managing the town's dealings with the wider Crossroads.`,
        baseImageUrl: 'https://media.charhub.io/dab03719-bf9b-42ad-b66a-3427c478000d/416b208c-14de-4e17-900c-221b8f9ee271.png',
        defaultImageUrl: 'https://media.charhub.io/dab03719-bf9b-42ad-b66a-3427c478000d/416b208c-14de-4e17-900c-221b8f9ee271.png',
        cost: {}, // Free; starter module
        action: (module: Module, stage: Stage, setScreenType: (type: ScreenType) => void) => {
            // If there is a rep from a faction here, open a faction interaction skit
            if (stage.getSave().commsVisitors?.length ?? 0 > 0) {
                const faction = Object.values(stage.getSave().factions).find(a => a.representativeId && stage.getSave().commsVisitors?.includes(a.representativeId));
                if (faction) {
                    // Move the module's owner (if any) here:
                    const owner = module.ownerId ? stage.getSave().actors[module.ownerId] : undefined;
                    if (owner && !owner.isOffSite(stage.getSave())) {
                        owner.locationId = module.id;
                    }
                    // Introduce a new faction:
                    if (!faction.active && faction?.reputation > 0) {
                        // Activate a new faction:
                        faction.active = true;
                        stage.setSkit({
                            type: SkitType.FACTION_INTRODUCTION,
                            moduleId: module.id,
                            script: [],
                            generating: true,
                            context: {factionId: faction.id,}
                        });
                    } else {
                        stage.setSkit({
                            type: SkitType.FACTION_INTERACTION,
                            moduleId: module.id,
                            script: [],
                            generating: true,
                            context: {factionId: faction.id}
                        });
                    }
                    setScreenType(ScreenType.SKIT);
                }
            } else if (Object.values(stage.getSave().actors).some(a => a.locationId === module.id)) {
                console.log("Opening skit.");
                stage.setSkit({
                    type: SkitType.RANDOM_ENCOUNTER,
                    moduleId: module.id,
                    script: [],
                    generating: true,
                    context: {}
                });
                setScreenType(ScreenType.SKIT);
            }
        },
        available: (stage: Stage) => {
            // Can have only one in stage.getSave().layout:
            return stage.getLayout().getModulesWhere(m => m.type === 'comms').length === 0;
        }
    },
    generator: {
        name: 'Public Works',
        skitPrompt: `Public Works keeps the town running: power, water, roads, and the occasional stubborn mystery in the pipes. Scenes here often involve the town's overall infrastructure and upkeep.`,
        imagePrompt: `A tidy small-town public works yard with a humming utility building, a water tower, workbenches of tools, spools of cable, and neatly organized maintenance equipment.`,
        role: 'Engineer',
        roleDescription: `Tend the town's utilities and infrastructure, ensuring every building has the power, water, and maintenance it needs to function properly.`,
        baseImageUrl: 'https://media.charhub.io/b978c4d3-d24a-44f4-a75b-e4f5d3bcd0b2/d01a6221-b46e-4d47-9e32-d99406582acc.png',
        defaultImageUrl: 'https://media.charhub.io/b978c4d3-d24a-44f4-a75b-e4f5d3bcd0b2/d01a6221-b46e-4d47-9e32-d99406582acc.png',
        cost: {}, // Free; starter module
        action: randomAction,
        available: (stage: Stage) => {
            // Can have only one in stage.getSave().layout:
            return stage.getLayout().getModulesWhere(m => m.type === 'generator').length === 0;
        }
    },
    quarters: {
        name: 'Home',
        skitPrompt: `Homes are the residents' own houses and personal spaces. Scenes here often involve personal interactions: revelations, troubles, interests, or relaxation.`,
        imagePrompt: `A cozy small-town home interior with comfortable furniture, personal touches, and warm evening light, reflecting the occupant's personality.`,
        baseImageUrl: 'https://media.charhub.io/66449ff3-1a40-4e41-a008-d541ae05bcec/112975ea-7924-4ddc-9a9f-63779c4bec7d.png', 
        defaultImageUrl: 'https://media.charhub.io/66449ff3-1a40-4e41-a008-d541ae05bcec/112975ea-7924-4ddc-9a9f-63779c4bec7d.png',
        cost: {Provision: 1},
        action: (module: Module, stage: Stage, setScreenType: (type: ScreenType) => void) => {
            // Open the skit screen to speak to occupants
            const owner = module.ownerId ? stage.getSave().actors[module.ownerId] : undefined;
            if (owner && !owner.isOffSite(stage.getSave())) {
                console.log("Opening skit.");
                owner.locationId = module.id; // Ensure actor is in the module
                stage.setSkit({
                    type: SkitType.VISIT_CHARACTER,
                    actorId: module.ownerId,
                    moduleId: module.id,
                    script: [],
                    generating: true,
                    context: {}
                });
                setScreenType(ScreenType.SKIT);
            }
        },
        available: (stage: Stage) => {
            // Can have multiple quarters; no restriction
            return true;
        }
    },
    commons: {
        name: 'Tavern',
        skitPrompt: `The tavern is where townsfolk and visitors gather to eat, drink, relax, and swap news. Scenes here often involve camaraderie, conflicts, and leisure among the residents.`,
        imagePrompt: `A warm, inviting tavern with a long bar, mismatched tables and chairs, a big hearth, a chalkboard menu, and a busy kitchen pass along the far wall.`,
        role: 'Host',
        roleDescription: `Run the town's gathering place, keeping it inviting and well-stocked for residents' meals, drinks, and get-togethers.`,
        baseImageUrl: 'https://media.charhub.io/c752b842-b465-451c-b870-3d2d612e51c0/f8ee79f3-d243-4a5e-be01-78a6412e132c.png', 
        defaultImageUrl: 'https://media.charhub.io/c752b842-b465-451c-b870-3d2d612e51c0/f8ee79f3-d243-4a5e-be01-78a6412e132c.png',
        cost: {Provision: 1},
        action: randomAction,
        available: (stage: Stage) => {
            // Can have only one in stage.getSave().layout:
            return stage.getLayout().getModulesWhere(m => m.type === 'commons').length === 0;
        }
    },
    infirmary: {
        name: 'Apothecary',
        skitPrompt: `The apothecary is the town's clinic and pharmacy, where residents receive treatment and care. Scenes here often involve injuries, ailments, or ways to improve the residents' health and well-being.`,
        imagePrompt: `A sunlit small-town clinic with tidy cots, shelves of jarred herbs and remedies alongside modern first-aid supplies, and a practitioner's workbench.`,
        role: 'Healer',
        roleDescription: `Provide healing and remedies for the residents, ensuring their health and well-being.`,
        baseImageUrl: 'https://media.charhub.io/cb482b96-fa2e-44cf-83ea-b90fb7d53467/c4c2851e-a111-4ffa-9cab-ba039738c88d.png',
        defaultImageUrl: 'https://media.charhub.io/cb482b96-fa2e-44cf-83ea-b90fb7d53467/c4c2851e-a111-4ffa-9cab-ba039738c88d.png',
        cost: {Provision: 1, Comfort: 1},
        action: randomAction,
        available: (stage: Stage) => {
            // Can have only one in stage.getSave().layout:
            return stage.getLayout().getModulesWhere(m => m.type === 'infirmary').length === 0;
        }
    },
    gym: {
        name: 'Training Yard',
        skitPrompt: `The training yard is where residents exercise, train, and blow off steam. Scenes here often involve training sessions, friendly contests, or ways to boost morale through physical activity.`,
        imagePrompt: `An open-air training yard with a small gym shed, free weights, a stretch of running track around a green, practice equipment, and benches under a shade tree.`,
        role: 'Coach',
        roleDescription: `Run the town's training and fitness programs, keeping residents active and spirits high.`,
        baseImageUrl: 'https://media.charhub.io/9af4597d-a1bd-4f6e-9680-33de1b230333/00b3e479-5ad4-4225-b35d-ed1b15c2d2ff.png',
        defaultImageUrl: 'https://media.charhub.io/9af4597d-a1bd-4f6e-9680-33de1b230333/00b3e479-5ad4-4225-b35d-ed1b15c2d2ff.png',
        cost: {Comfort: 1, Wealth: 1},
        action: randomAction,
        available: (stage: Stage) => {
            // Can have only one in stage.getSave().layout:
            return stage.getLayout().getModulesWhere(m => m.type === 'gym').length === 0;
        }
    },
    lounge: {
        name: 'Town Hall',
        skitPrompt: `The town hall houses the Founder's office and the desks of the town staff, and is where official business gets done: permits, plans, records, and the occasional dispute. Scenes here often involve town business, planning, paperwork, or residents dropping by with requests.`,
        imagePrompt: `A modest town hall interior with a records counter, filing cabinets, a notice board layered with flyers, staff desks with warm lamps, and the Founder's office door standing ajar.`,
        role: 'Clerk',
        roleDescription: `Keep the town's records and official business in order, supporting the Founder and staff in the day-to-day running of the town.`,
        baseImageUrl: 'https://media.charhub.io/9c7272aa-b468-4a04-8013-c643149cea29/5de9e404-a651-4b21-bc2a-7050c43dc995.png',
        defaultImageUrl: 'https://media.charhub.io/9c7272aa-b468-4a04-8013-c643149cea29/5de9e404-a651-4b21-bc2a-7050c43dc995.png',
        cost: {Comfort: 2, Wealth: 1},
        action: randomAction,
        available: (stage: Stage) => {
            // Require at least three patients on board to build a lounge:
            const patientCount = Object.values(stage.getSave().actors).filter(a => a.origin === 'patient').length;
            // Can have only one in stage.getSave().layout:
            return stage.getLayout().getModulesWhere(m => m.type === 'lounge').length === 0 && patientCount >= 3;
        }
    },
    armory: {
        name: 'Watch Post',
        skitPrompt: `The watch post is the town's security hub, where the wards, watch rotations, and emergency plans are managed; the nearby countryside is gentle, but the deeper frontier is still wild. Scenes here often involve security matters, incident reports, or ways to keep the town safe.`,
        imagePrompt: `A small-town watch post with a duty desk, a radio set, a wall map dotted with pins, storage lockers, and rain slickers and lanterns hung by the door.`,
        role: 'Watch Captain',
        roleDescription: `Manage the town's watch and defenses, ensuring the safety of the residents from whatever the frontier turns up.`,
        baseImageUrl: 'https://media.charhub.io/a4a6c1ed-866d-439b-a9c0-1a00897187b9/ba47369e-b666-4a31-9745-54f9ccf294fb.png',
        defaultImageUrl: 'https://media.charhub.io/a4a6c1ed-866d-439b-a9c0-1a00897187b9/ba47369e-b666-4a31-9745-54f9ccf294fb.png',
        cost: {Infrastructure: 1, Wealth: 1},
        action: randomAction,
        available: (stage: Stage) => {
            // Require to have met at least three factions:
            const metFactionsCount = Object.values(stage.getSave().factions).filter(f => f.active).length;
            // Can have only one in stage.getSave().layout:
            return stage.getLayout().getModulesWhere(m => m.type === 'armory').length === 0 && metFactionsCount >= 3;
        }
    },
    'cryo bank': {
        name: `Explorers' Guild`,
        skitPrompt: `The Explorers' Guild charters expeditions into the unmapped frontier beyond the town; residents who sign on are away in the field until they return, and the Guild keeps the maps, trophies, and expedition ledgers. Scenes in this room often involve send-offs, returns, tales from the field, or planning the next venture.`,
        imagePrompt: `A rustic explorers' guild hall with a large frontier map pinned with route markers, packs and gear hung on wall hooks, shelves of odd trophies and finds, and a heavy sign-up ledger on a sturdy desk.`,
        role: 'Guildmaster',
        roleDescription: `Run the Explorers' Guild, chartering expeditions into the frontier and tracking who is in the field and when they are due back.`,
        baseImageUrl: 'https://media.charhub.io/d081e188-8bd0-4027-9e21-489840924a95/968a7272-75f1-4b3d-b516-64588d9b0f03.png',
        defaultImageUrl: 'https://media.charhub.io/d081e188-8bd0-4027-9e21-489840924a95/968a7272-75f1-4b3d-b516-64588d9b0f03.png',
        cost: {Harmony: 2, Infrastructure: 2},
        action: (module: Module, stage: Stage, setScreenType: (type: ScreenType) => void) => {
            // Open the cryo management screen
            console.log("Opening cryo screen from cryo bank.");
            setScreenType(ScreenType.CRYO);
        },
        available: (stage: Stage) => {
            // Can have only one in stage.getSave().layout, and only once there are at least five patients:
            const patientCount = Object.values(stage.getSave().actors).filter(a => a.origin === 'patient').length;
            return stage.getLayout().getModulesWhere(m => m.type === 'cryo bank').length === 0 && patientCount >= 5;
        }
    },
    'aperture': {
        name: 'Wishing Well',
        skitPrompt: `The Wishing Well plaza is where the town tends the well at its heart - and where the Founder may cast a wish of their own into the current, describing the sort of person they hope will apply for residency. Scenes here often involve quiet wellside conversations, curiosity about how the well works, or unexpected phenomena.`,
        imagePrompt: `A picturesque stone wishing well at the center of a tidy plaza, coins glinting beneath clear water that glimmers faintly with otherworldly light, ringed by lampposts, flowerbeds, and benches.`,
        role: 'Wellkeeper',
        roleDescription: `Tend the Wishing Well and study its current, helping shape the wishes the town casts out into the worlds.`,
        baseImageUrl: 'https://media.charhub.io/a543e339-136b-4c51-8c64-02f467d8316b/ce0ebe1d-8b03-4734-8a71-5d1873b181a4.png',
        defaultImageUrl: 'https://media.charhub.io/a543e339-136b-4c51-8c64-02f467d8316b/ce0ebe1d-8b03-4734-8a71-5d1873b181a4.png',
        cost: {Infrastructure: 2, Wealth: 2},
        action: (module: Module, stage: Stage, setScreenType: (type: ScreenType) => void) => {
            // Open the attenuation screen
            console.log("Opening aperture screen from aperture module.");
            setScreenType(ScreenType.APERTURE);
        },
        available: (stage: Stage) => {
            // Can have only one in stage.getSave().layout, and only once the town's Infrastructure stat is at least 5:
            const infrastructureStat = stage.getSave().stationStats?.[StationStat.INFRASTRUCTURE] || 0;
            return stage.getLayout().getModulesWhere(m => m.type === 'aperture').length === 0 && infrastructureStat >= 5;
        }
    }
};

/**
 * Register a custom faction module template at runtime
 */
export function registerFactionModule(faction: Faction,
    type: string,
    intrinsic: ModuleIntrinsic
): void {
    registerModule(type, intrinsic, randomAction, (stage: Stage) => {
        // Custom modules can only be built once and require minimum reputation with the faction
        const factionRep = stage.getSave().factions[faction.id]?.reputation || 0;
        const existingCount = stage.getLayout().getModulesWhere(m => m.type === type).length;
        return existingCount === 0 && factionRep >= 6;
    });
}

export function registerModule(type: string, intrinsic: ModuleIntrinsic, action?: (module: Module, stage: Stage, setScreenType: (type: ScreenType) => void) => void, available?: (stage: Stage) => boolean): void {
    MODULE_TEMPLATES[type] = {...intrinsic,
        action: action || intrinsic.action || randomAction,
        available: available || ((stage: Stage) => {return stage.getLayout().getModulesWhere(m => m.type === type).length === 0})
    };
}

/**
 * Check if a module type is registered (either built-in or custom)
 */
export function isModuleTypeRegistered(type: string): boolean {
    return type in MODULE_TEMPLATES;
}

/**
 * Get the template for a module type
 */
export function getModuleTemplate(type: string): ModuleIntrinsic | undefined {
    return MODULE_TEMPLATES[type];
}

export class Module<T extends ModuleType = ModuleType> {
    public id: string;
    public type: T;
    public ownerId?: string; // For quarters, this is the occupant, for other modules, it is the character assigned to the associated role
    public attributes?: Partial<ModuleIntrinsic> & { [key: string]: any };
    public linkedModuleIds?: string[]; // Adjacent modules this room shares narrative space with (owners appear in each other's scenes).

    /**
     * Rehydrate a Module from saved data
     */
    static fromSave(savedModule: any): Module {
        let type = savedModule.type === 'medbay' ? 'infirmary' : savedModule.type; // Backwards compatibility
        type = type === 'communications' ? 'comms' : type; // Backwards compatibility
        const module = createModule(type as ModuleType, {
            id: savedModule.id,
            attributes: savedModule.attributes,
            ownerId: savedModule.ownerId
        });
        if (Array.isArray(savedModule.linkedModuleIds)) {
            module.linkedModuleIds = [...savedModule.linkedModuleIds];
        }
        return module;
    }

    constructor(type: T, opts?: { id?: string; attributes?: Partial<ModuleIntrinsic> & { [key: string]: any }; ownerId?: string }) {
        this.id = opts?.id ?? `${type}-${Date.now()}`;
        this.type = type;
        this.ownerId = opts?.ownerId;
        this.attributes = opts?.attributes || {};
    }

    /**
     * Get all attributes with intrinsic defaults applied
     */
    getAttributes(): ModuleIntrinsic & { [key: string]: any } {
        const defaults = MODULE_TEMPLATES[this.type] || {};
        return { ...defaults, ...(this.attributes || {}) };
    }

    /**
     * Get a specific attribute with intrinsic default fallback
     */
    getAttribute<K extends keyof ModuleIntrinsic>(key: K): ModuleIntrinsic[K];
    getAttribute(key: string): any;
    getAttribute(key: string): any {
        const instanceValue = this.attributes?.[key];
        if (instanceValue !== undefined) {
            return instanceValue;
        }
        return MODULE_TEMPLATES[this.type]?.[key];
    }

    /**
     * Get the action method for this module type
     */
    getAction(): ((module: Module, stage: Stage, setScreenType: (type: ScreenType) => void) => void) {
        return MODULE_TEMPLATES[this.type]?.action || randomAction;
    }
}

export function createModule(type: ModuleType, opts?: { id?: string; attributes?: Partial<ModuleIntrinsic> & { [key: string]: any }; ownerId?: string }): Module {
    return new Module(type, opts);
}

export const DEFAULT_GRID_SIZE = 6; // Deprecated - use DEFAULT_GRID_WIDTH and DEFAULT_GRID_HEIGHT
export const DEFAULT_GRID_WIDTH = 8;
export const DEFAULT_GRID_HEIGHT = 5;

export type LayoutChangeHandler = (grid: Module[]) => void;

// The buildable footprint of each floor: a circle-like shape within the 8x5 grid,
// a 3x3 center (cols 3-5, rows 1-3) plus three cells extending in each cardinal direction.
export const FLOOR_FOOTPRINT: ReadonlyArray<{ x: number; y: number }> = [
    // center 3x3
    {x:3,y:1},{x:4,y:1},{x:5,y:1},
    {x:3,y:2},{x:4,y:2},{x:5,y:2},
    {x:3,y:3},{x:4,y:3},{x:5,y:3},
    // top arm
    {x:3,y:0},{x:4,y:0},{x:5,y:0},
    // bottom arm
    {x:3,y:4},{x:4,y:4},{x:5,y:4},
    // left arm
    {x:2,y:1},{x:2,y:2},{x:2,y:3},
    // right arm
    {x:6,y:1},{x:6,y:2},{x:6,y:3},
];

export function isFootprintCell(x: number, y: number): boolean {
    return FLOOR_FOOTPRINT.some(c => c.x === x && c.y === y);
}

// UI cells for floor navigation (NOT modules - characters cannot route to these).
export const BUILD_UP_CELL = { x: 2, y: 0 };   // upper-left: "build next floor" / "go up" once built
export const GO_DOWN_CELL = { x: 2, y: 4 };    // lower-left: "go down" appears on floors above the first

export const MAX_FLOORS = 5;

// Escalating cost to build each floor, indexed by the floor being built (floor 2 = index 2).
// Floor 1 exists for free at game start. Values are town-stat point costs.
export const FLOOR_BUILD_COSTS: Record<number, Partial<Record<StationStat, number>>> = {
    2: { [StationStat.COMFORT]: 1, [StationStat.HARMONY]: 1 },
    3: { [StationStat.HARMONY]: 1, [StationStat.INFRASTRUCTURE]: 1, [StationStat.WEALTH]: 1 },
    4: { [StationStat.HARMONY]: 2, [StationStat.INFRASTRUCTURE]: 1, [StationStat.SECURITY]: 1 },
    5: { [StationStat.HARMONY]: 2, [StationStat.INFRASTRUCTURE]: 2, [StationStat.SECURITY]: 1, [StationStat.WEALTH]: 1 },
};


export class Layout {
    // Multi-floor storage. floors[f] is a 2D grid (grid[y][x]) for floor f (0-indexed).
    // Floor 0 is the ground floor. currentFloor is the floor currently displayed/edited.
    public floors: (Module | null)[][][];
    public currentFloor: number;
    public gridWidth: number;
    public gridHeight: number;

    // Deprecated: gridSize kept for backward compatibility
    public get gridSize(): number {
        return Math.max(this.gridWidth, this.gridHeight);
    }

    // The active floor's grid. Existing code that reads `layout.grid` keeps working,
    // operating on whichever floor is currently displayed.
    public get grid(): (Module | null)[][] {
        return this.floors[this.currentFloor];
    }
    public set grid(g: (Module | null)[][]) {
        this.floors[this.currentFloor] = g;
    }

    private static emptyGrid(width: number, height: number): (Module | null)[][] {
        return Array.from({ length: height }, () => Array.from({ length: width }, () => null));
    }

    constructor(width: number = DEFAULT_GRID_WIDTH, height: number = DEFAULT_GRID_HEIGHT, initial?: (Module | null)[][]) {
        this.gridWidth = width;
        this.gridHeight = height;
        this.floors = [initial || Layout.emptyGrid(width, height)];
        this.currentFloor = 0;
    }

    /** Number of floors that have been built. */
    get floorCount(): number {
        return this.floors.length;
    }

    /** Adds a new empty floor on top and returns its index. Caller enforces MAX_FLOORS and cost. */
    addFloor(): number {
        if (this.floors.length >= MAX_FLOORS) return this.floors.length - 1;
        this.floors.push(Layout.emptyGrid(this.gridWidth, this.gridHeight));
        return this.floors.length - 1;
    }

    setCurrentFloor(index: number): void {
        if (index >= 0 && index < this.floors.length) {
            this.currentFloor = index;
        }
    }

    /** True when every buildable footprint cell on the given floor holds a module. */
    isFloorFull(floorIndex: number): boolean {
        const grid = this.floors[floorIndex];
        if (!grid) return false;
        return FLOOR_FOOTPRINT.every(cell => grid[cell.y]?.[cell.x]);
    }

    /**
     * Rehydrate a Layout from saved data. Supports:
     *  - new multi-floor saves (savedLayout.floors)
     *  - old single-grid saves (savedLayout.grid) -> becomes floor 0
     */
    static fromSave(savedLayout: any): Layout {
        const layout: Layout = Object.create(Layout.prototype);

        if (savedLayout.gridWidth !== undefined && savedLayout.gridHeight !== undefined) {
            layout.gridWidth = savedLayout.gridWidth;
            layout.gridHeight = savedLayout.gridHeight;
        } else {
            layout.gridWidth = DEFAULT_GRID_WIDTH;
            layout.gridHeight = DEFAULT_GRID_HEIGHT;
        }

        const rehydrateGrid = (rawGrid: any[]): (Module | null)[][] => {
            const source = rawGrid?.map((row: any[]) =>
                row?.map((savedModule: any) => savedModule ? Module.fromSave(savedModule) : null)
            ) || [];
            const grid = Layout.emptyGrid(layout.gridWidth, layout.gridHeight);
            const relocate: Module[] = [];
            for (let y = 0; y < source.length; y++) {
                for (let x = 0; x < (source[y]?.length || 0); x++) {
                    const module = source[y][x];
                    if (!module) continue;
                    if (y < layout.gridHeight && x < layout.gridWidth) {
                        grid[y][x] = module;
                    } else {
                        relocate.push(module);
                    }
                }
            }
            for (const module of relocate) {
                let placed = false;
                for (let y = 0; y < layout.gridHeight && !placed; y++) {
                    for (let x = 0; x < layout.gridWidth && !placed; x++) {
                        if (!grid[y][x]) { grid[y][x] = module; placed = true; }
                    }
                }
            }
            return grid;
        };

        if (Array.isArray(savedLayout.floors)) {
            layout.floors = savedLayout.floors.map((floorGrid: any[]) => rehydrateGrid(floorGrid));
            if (layout.floors.length === 0) {
                layout.floors = [Layout.emptyGrid(layout.gridWidth, layout.gridHeight)];
            }
        } else {
            // Legacy single-floor save
            layout.floors = [rehydrateGrid(savedLayout.grid)];
        }
        layout.currentFloor = (typeof savedLayout.currentFloor === 'number' &&
            savedLayout.currentFloor >= 0 && savedLayout.currentFloor < layout.floors.length)
            ? savedLayout.currentFloor : 0;

        return layout;
    }

    getLayout(): (Module | null)[][] {
        return this.grid;
    }

    setLayout(layout: (Module | null)[][]) {
        this.grid = layout;
    }

    getActorsAtModule(module: Module, save: SaveType): Actor[] {
        return Object.values(save.actors).filter(actor => actor.locationId === module.id);
    }

    /** Scans the CURRENT floor only. */
    getModulesWhere(predicate: (module: Module) => boolean): Module[] {
        const modules: Module[] = [];
        const grid = this.grid;
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                const module = grid[y][x];
                if (module && predicate(module)) modules.push(module);
            }
        }
        return modules;
    }

    /** Scans ALL floors. Used for movement/lookup so characters can reach rooms on any floor. */
    getAllModulesWhere(predicate: (module: Module) => boolean): Module[] {
        const modules: Module[] = [];
        for (const grid of this.floors) {
            for (let y = 0; y < this.gridHeight; y++) {
                for (let x = 0; x < this.gridWidth; x++) {
                    const module = grid[y][x];
                    if (module && predicate(module)) modules.push(module);
                }
            }
        }
        return modules;
    }

    /** Searches every floor by id. */
    getModuleById(id: string): Module | null {
        for (const grid of this.floors) {
            for (let y = 0; y < this.gridHeight; y++) {
                for (let x = 0; x < this.gridWidth; x++) {
                    const module = grid[y][x];
                    if (module && module.id === id) return module;
                }
            }
        }
        return null;
    }

    /** Returns the floor index a module lives on, or -1. */
    getModuleFloor(id: string): number {
        for (let f = 0; f < this.floors.length; f++) {
            const grid = this.floors[f];
            for (let y = 0; y < this.gridHeight; y++) {
                for (let x = 0; x < this.gridWidth; x++) {
                    if (grid[y][x]?.id === id) return f;
                }
            }
        }
        return -1;
    }

    getModuleAt(x: number, y: number): Module | null {
        return this.grid[y]?.[x] ?? null;
    }

    /** Returns modules orthogonally adjacent to the given module on its own floor (excludes quarters). */
    getAdjacentModules(module: Module | null): Module[] {
        if (!module) return [];
        // Find which floor the module is on and its coordinates there.
        for (let f = 0; f < this.floors.length; f++) {
            const grid = this.floors[f];
            for (let y = 0; y < this.gridHeight; y++) {
                for (let x = 0; x < this.gridWidth; x++) {
                    if (grid[y]?.[x]?.id === module.id) {
                        const neighbors: Module[] = [];
                        const deltas = [[0, -1], [0, 1], [-1, 0], [1, 0]];
                        for (const [dx, dy] of deltas) {
                            const nx = x + dx, ny = y + dy;
                            const n = grid[ny]?.[nx];
                            if (n && n.type !== 'quarters') neighbors.push(n);
                        }
                        return neighbors;
                    }
                }
            }
        }
        return [];
    }

    /** Coordinates on the CURRENT floor. */
    getModuleCoordinates(module: Module | null): { x: number; y: number } {
        const grid = this.grid;
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (module && grid[y][x]?.id === module?.id) return { x, y };
            }
        }
        return {x: -1000, y: -1000};
    }

    setModuleAt(x: number, y: number, module: Module) {
        if (!this.grid[y]) return;
        this.grid[y][x] = module;
    }

    /** Removes a module by identity, searching every floor. */
    removeModule(module: Module | null): boolean {
        if (!module) return false;
        for (const grid of this.floors) {
            for (let y = 0; y < this.gridHeight; y++) {
                for (let x = 0; x < this.gridWidth; x++) {
                    if (grid[y][x]?.id === module.id) { grid[y][x] = null; return true; }
                }
            }
        }
        return false;
    }

    removeModuleAt(x: number, y: number): Module | null {
        const module = this.grid[y]?.[x] || null;
        if (module && this.grid[y]) this.grid[y][x] = null;
        return module;
    }
}

export async function generateModule(name: string, stage: Stage, additionalInformation?: string, role?: string): Promise<ModuleIntrinsic|null> {
    // Generate a module from a module name, some arbitrary details, and a role title
    const generatedResponse = await stage.makeText({
        prompt: `{{messages}}This is preparatory request for structured and formatted game content. ` +
            `The goal is to define a building for a cozy town management game, based primarily upon the name and/or the additional information provided, ` +
            `while generally avoiding duplicating existing content below. ` +
            buildPromptSegment(`Existing Modules`, Object.entries(MODULE_TEMPLATES).map(([type, mod]) => `- ${type}: Role - ${mod.role || 'N/A'}`).join('\n')) +
            buildPromptSegment(`New Module Details`, `Name: ${name || 'N/A'}\nNew Role: ${role || 'N/A'}\nAdditional Information: ${additionalInformation || 'N/A'}`) +
            buildPromptSegment(`Background`, `This game is a fantasy multiverse setting that pulls characters from across eras, worlds, and settings. ` +
                `The player of this game, ${stage.getSave().player.name}, is the Founder of Second Chance Town, a young frontier community on the edge of the Crossroads - a realm between realms - whose Wishing Well hears the wishes of people across the worlds who truly long for a new life, ` +
                `with the goal of welcoming these volunteers and helping them settle into a new role in this world. ` +
                `Modules are the buildings and facilities that make up the town; each has a function varying between utility and entertainment or anything inbetween, and serves as a backdrop for various interactions and events. ` +
                `Every module offers a resident-assignable role with an associated responsibility or purpose, which can again vary wildly between practical and whimsical.`) +
            buildPromptSegment(`Instructions`, `After carefully considering the provided details, the System will generate a formatted definition for a distinct and inspired town building that suits the prompt, outputting it in the following strict format:\n` +
                `MODULE NAME: The module's simple name (1-2 words)\n` +
                `PURPOSE: A brief summary of the building's function and role in the town, as well as how that role might affect the town's residents or inform skits at this location.\n` +
                `DESCRIPTION: A vivid visual description of the module's appearance, to be fed into image generation.\n` +
                `ROLE NAME: The simple title of the role associated with this module (1-2 words).\n` +
                `ROLE DESCRIPTION: A brief summary of the responsibilities and duties associated with this role.\n` +
                `COST: The resource cost to build this building, specified as 1-3 points of one or two town stats. Available stats are: Infrastructure, Comfort, Provision, Security, Harmony, Wealth. Format as "StatName X, StatName Y" (e.g., "Wealth 2, Infrastructure 1" or "Provision 2").\n` +
                `#END#`) +
            buildPromptSegment(`Example Response`,
                `MODULE NAME: Greenhouse\n` +
                `PURPOSE: The greenhouse grows fresh produce and flowers for the town year-round. Scenes in this building often involve gardening, quiet conversations among the plants, or the small dramas of a prize tomato.\n` +
                `DESCRIPTION: A glass-paneled greenhouse warm with filtered sunlight, full of raised beds, hanging planters, seed trays, and a potting bench cluttered with tools and gloves.\n` +
                `ROLE NAME: Gardener\n` +
                `ROLE DESCRIPTION: Responsible for tending the greenhouse and its crops, keeping the town supplied with fresh produce and the occasional bouquet.\n` +
                `COST: Provision 2, Infrastructure 1\n` +
                `#END#`) +
            buildPromptSegment(`Example Response`,
                `MODULE NAME: Radio Station\n` +
                `PURPOSE: The town's little radio station broadcasts music, news, and neighborly gossip across the valley. Scenes here often involve interviews, song requests, on-air mishaps, or ways to boost morale through entertainment.\n` +
                `DESCRIPTION: A snug broadcast booth with foam-paneled walls, a cluttered mixing desk, shelves of records and tapes, and an ON AIR sign glowing over the door.\n` +
                `ROLE NAME: Broadcaster\n` +
                `ROLE DESCRIPTION: Runs the town's radio programming, keeping residents informed, entertained, and gently teased.\n` +
                `COST: Comfort 1, Wealth 1\n` +
                `#END#`),
        stop: ['#END'],
        include_history: true,
        max_tokens: 400,
    });

    console.log('Generated module distillation:');
    console.log(generatedResponse);

    if (!generatedResponse) {
        console.error('Failed to generate module');
        return null;
    }

    // Parse the generated response
    const lines = generatedResponse.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
    
    let moduleName = '';
    let purpose = '';
    let description = '';
    let roleName = '';
    let roleDescription = '';
    let costString = '';

    for (const line of lines) {
        if (line.startsWith('MODULE NAME:')) {
            moduleName = line.substring('MODULE NAME:'.length).trim().toLowerCase();
        } else if (line.startsWith('PURPOSE:')) {
            purpose = line.substring('PURPOSE:'.length).trim();
        } else if (line.startsWith('DESCRIPTION:')) {
            description = line.substring('DESCRIPTION:'.length).trim();
        } else if (line.startsWith('ROLE NAME:')) {
            roleName = line.substring('ROLE NAME:'.length).trim();
        } else if (line.startsWith('ROLE DESCRIPTION:')) {
            roleDescription = line.substring('ROLE DESCRIPTION:'.length).trim();
        } else if (line.startsWith('COST:')) {
            costString = line.substring('COST:'.length).trim();
        }
    }

    moduleName = moduleName || name || '';
    roleName = roleName || role || '';

    // Validation
    if (!moduleName || !purpose || !description || !roleName || !roleDescription) {
        console.error('Failed to parse required fields from generated module', {
            moduleName, purpose, description, roleName, roleDescription
        });
        return null;
    }
    
    if (moduleName.length < 2 || moduleName.length > 30) {
        console.error('Module name has invalid length:', moduleName);
        return null;
    }

    // Parse cost with default fallback
    const parsedCost: {[key in StationStat]?: number} = {};
    
    if (costString) {
        // Parse cost string like "Wealth 2, Infrastructure 1" or "Provision 2"
        const costParts = costString.split(',').map(s => s.trim());
        
        for (const part of costParts) {
            // Match pattern: "StatName Number"
            const match = part.match(/^([a-zA-Z]+)\s+(\d+)$/);
            if (match) {
                const statName = match[1];
                const amount = parseInt(match[2]);
                
                // Find matching StationStat (case-insensitive)
                for (const stat of Object.values(StationStat)) {
                    if (stat.toLowerCase() === statName.toLowerCase()) {
                        // Clamp to 1-3 as specified
                        parsedCost[stat] = Math.max(1, Math.min(3, amount));
                        break;
                    }
                }
            }
        }
    }
    
    // Apply default cost if parsing failed or resulted in no costs
    const finalCost = Object.keys(parsedCost).length > 0 
        ? parsedCost 
        : { [StationStat.WEALTH]: 2, [StationStat.INFRASTRUCTURE]: 1 }; // Default: 2 Wealth, 1 Systems

    const module: ModuleIntrinsic = {
        name: moduleName,
        skitPrompt: purpose,
        imagePrompt: description,
        role: roleName,
        roleDescription: roleDescription,
        baseImageUrl: '',
        defaultImageUrl: '',
        cost: finalCost,
    };

    await generateModuleImage(module, stage);

    if (!module.baseImageUrl || !module.defaultImageUrl) {
        console.error('Failed to generate images for module');
        return null;
    }

    return module;
}

export async function generateModuleImage(module: ModuleIntrinsic, stage: Stage): Promise<void> {
    // Start with a base image:
    const baseImageUrl = await stage.makeImage({
        prompt: `The detailed interior or grounds of an unoccupied building in a cozy small town. The design should reflect the following description: ${module.imagePrompt}. ` +
            `Regardless of aesthetic, the image is rendered in a vibrant, painterly style with thick smudgy lines.`,
        aspect_ratio: AspectRatio.SQUARE
    }, '');
    if (!baseImageUrl) {
        return;
    }
    // Next, create a default variant with Qwen's image-to-image:
    const defaultImageUrl = await stage.makeImageFromImage({
        image: baseImageUrl,
        prompt: `Apply a visual novel art style to this cozy small-town location (${module.imagePrompt}). Remove any characters from the scene.`,
        transfer_type: 'edit'
    }, '');
    if (baseImageUrl && defaultImageUrl) {
        module.baseImageUrl = baseImageUrl;
        module.defaultImageUrl = defaultImageUrl;
    }
}
