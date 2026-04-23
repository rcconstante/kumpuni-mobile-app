export interface GuideContent {
  id: string;
  categoryId: string;
  subCategoryId: string;
  title: string;
  overview: string;
  tools: string[];
  steps: string[];
  safetyNotes: string;
  callProfessional: string;
  ifixitUrl?: string;
}

export const GUIDE_CONTENTS: GuideContent[] = [
  {
    id: 'leaky-faucet',
    categoryId: 'home',
    subCategoryId: 'water-plumbing',
    title: 'Leaky faucet',
    overview: 'A faucet that drips even when fully turned off is usually caused by a worn washer, cartridge, or loose fitting.',
    tools: ['Adjustable wrench', 'screwdriver', 'cloth', 'replacement washer/cartridge', "plumber's tape"],
    steps: [
      'Turn off the water supply under the sink.',
      'Open the faucet to release any remaining water pressure.',
      'Plug the drain so small parts do not fall in.',
      'Remove the faucet handle using a screwdriver.',
      'Unscrew the faucet stem or cartridge housing.',
      'Inspect the washer or cartridge for wear, cracks, or damage.',
      'Replace the damaged part with a matching new one.',
      'Reassemble the faucet carefully.',
      'Turn the water supply back on.',
      'Test the faucet to check if the dripping stopped.',
    ],
    safetyNotes: 'Do not force parts loose too hard. Protect chrome surfaces with a cloth when using tools.',
    callProfessional: 'If the faucet body is cracked, badly corroded, or continues leaking after replacing parts.',
    ifixitUrl: 'https://www.ifixit.com/Guide/How+To+Fix+A+Leaky+Faucet/39117',
  },
  {
    id: 'low-water-pressure',
    categoryId: 'home',
    subCategoryId: 'water-plumbing',
    title: 'Low water pressure',
    overview: 'Weak water flow may come from clogged aerators, partially closed valves, pipe buildup, or supply issues.',
    tools: ['Cloth', 'wrench', 'toothbrush', 'vinegar', 'bucket'],
    steps: [
      'Check whether the issue affects one faucet or the whole house.',
      'If only one faucet is affected, unscrew the aerator at the faucet tip.',
      'Soak the aerator in vinegar for 30 minutes.',
      'Scrub away mineral buildup with a toothbrush.',
      'Reattach the aerator and test the flow.',
      'Check the shutoff valve under the sink and make sure it is fully open.',
      'If pressure is low in multiple fixtures, inspect the main valve.',
      'Ask neighbors or household members if they have the same problem.',
      'If the whole home is affected, contact your water provider or inspect for plumbing issues.',
    ],
    safetyNotes: 'Turn off the faucet before removing the aerator. Be careful not to lose small filter parts.',
    callProfessional: 'If the whole house has low pressure and the issue is not from the main supply.',
    ifixitUrl: 'https://www.ifixit.com/Search?query=low+water+pressure',
  },
  {
    id: 'clogged-sink',
    categoryId: 'home',
    subCategoryId: 'water-plumbing',
    title: 'Clogged sink',
    overview: 'A sink clog usually happens from grease, soap, food waste, or hair buildup.',
    tools: ['Plunger', 'bucket', 'gloves', 'baking soda', 'vinegar', 'drain snake'],
    steps: [
      'Remove any standing water if possible.',
      'Check and clear visible debris near the drain opening.',
      'Pour hot water slowly into the drain.',
      'Add baking soda, then vinegar, and wait 10 to 15 minutes.',
      'Flush again with hot water.',
      'If still clogged, use a sink plunger and make several firm plunges.',
      'Place a bucket under the sink trap.',
      'Unscrew and remove the P-trap carefully.',
      'Clear out debris inside the trap.',
      'Reattach the trap and run water to test.',
      'If needed, use a drain snake for deeper clogs.',
    ],
    safetyNotes: 'Avoid mixing different chemical cleaners. Wear gloves when handling trapped debris.',
    callProfessional: 'If the clog keeps returning or affects multiple drains.',
    ifixitUrl: 'https://www.ifixit.com/Guide/How+to+Unclog+a+Drain/143479',
  },
  {
    id: 'slow-draining-shower',
    categoryId: 'home',
    subCategoryId: 'water-plumbing',
    title: 'Slow draining shower',
    overview: 'Slow shower drainage is usually caused by hair, soap residue, or mineral buildup.',
    tools: ['Gloves', 'drain snake', 'screwdriver', 'hot water', 'baking soda', 'vinegar'],
    steps: [
      'Remove the drain cover with a screwdriver if needed.',
      'Pull out visible hair and debris by hand or with a hook.',
      'Pour hot water into the drain.',
      'Add baking soda and vinegar, then wait 10 to 15 minutes.',
      'Flush again with hot water.',
      'Insert a drain snake and rotate it gently to catch deeper hair clogs.',
      'Pull the snake out slowly and dispose of debris.',
      'Rinse the drain thoroughly.',
      'Reattach the drain cover.',
      'Test the water flow.',
    ],
    safetyNotes: 'Wear gloves. Be careful around sharp edges on the drain cover.',
    callProfessional: 'If water backs up badly or the clog seems deep in the pipe.',
    ifixitUrl: 'https://www.ifixit.com/Search?query=slow+draining+shower',
  },
  {
    id: 'running-toilet',
    categoryId: 'home',
    subCategoryId: 'water-plumbing',
    title: 'Running toilet',
    overview: 'A running toilet often means the flapper, fill valve, or chain is not working properly.',
    tools: ['Gloves', 'replacement flapper', 'adjustable pliers'],
    steps: [
      'Remove the toilet tank lid carefully.',
      'Flush the toilet and watch how the tank refills.',
      'Check if the flapper closes properly after flushing.',
      'Inspect the chain and make sure it is not too tight or tangled.',
      'If the flapper is worn or warped, replace it.',
      'Check the water level in the tank.',
      'Adjust the float if the water level is too high.',
      'Inspect the fill valve for continuous flow.',
      'Replace the fill valve if needed.',
      'Flush again and confirm the running stops.',
    ],
    safetyNotes: 'Set the tank lid down on a safe surface to avoid cracking it.',
    callProfessional: 'If parts are replaced but the toilet still runs or leaks from the base.',
    ifixitUrl: 'https://www.ifixit.com/Guide/Toilet+Runs+Constantly/48321',
  },
  {
    id: 'pipe-leak',
    categoryId: 'home',
    subCategoryId: 'water-plumbing',
    title: 'Pipe leak (minor)',
    overview: 'A minor pipe leak under a sink or along an exposed pipe may come from a loose connection or small crack.',
    tools: ['Bucket', 'cloth', 'wrench', "plumber's tape", 'pipe repair clamp or epoxy'],
    steps: [
      'Turn off the water supply to the affected area.',
      'Dry the pipe completely with a cloth.',
      'Check if the leak is coming from a joint or the pipe itself.',
      'If from a threaded joint, tighten it gently with a wrench.',
      "Wrap plumber's tape on threaded connections if needed.",
      'If the leak is from a small crack, apply a temporary pipe repair clamp or epoxy.',
      'Wait for the repair material to set if required.',
      'Turn the water back on slowly.',
      'Watch for dripping or seepage.',
      'Monitor the area over the next few hours.',
    ],
    safetyNotes: 'Temporary fixes are not long-term solutions. Keep electrical devices away from wet areas.',
    callProfessional: 'If the leak gets worse, the pipe is corroded, or the repair does not hold.',
    ifixitUrl: 'https://www.ifixit.com/Search?query=pipe+leak+repair',
  },
  {
    id: 'squeaky-hinges',
    categoryId: 'home',
    subCategoryId: 'doors-windows',
    title: 'Squeaky hinges',
    overview: 'Squeaky hinges usually need cleaning and lubrication.',
    tools: ['Lubricant', 'cloth', 'screwdriver', 'cotton swabs'],
    steps: [
      'Open and close the door to find the squeaky hinge.',
      'Wipe away dust and dirt from the hinge area.',
      'Apply lubricant directly to the hinge pin and moving parts.',
      'Move the door back and forth several times.',
      'Wipe off extra lubricant.',
      'Tighten any loose hinge screws.',
      'Test again for remaining noise.',
    ],
    safetyNotes: 'Do not overapply lubricant on floors because it can get slippery.',
    callProfessional: 'If the hinge is bent, broken, or the door frame is damaged.',
    ifixitUrl: 'https://www.ifixit.com/Search?query=squeaky+hinge',
  },
  {
    id: 'door-wont-close',
    categoryId: 'home',
    subCategoryId: 'doors-windows',
    title: "Door won't close",
    overview: 'A door that does not shut properly may be misaligned, swollen, or have loose hardware.',
    tools: ['Screwdriver', 'sandpaper', 'pencil', 'level'],
    steps: [
      'Check where the door rubs against the frame.',
      'Tighten all hinge screws.',
      'Test the door again after tightening.',
      'If the latch misses the strike plate, inspect alignment.',
      'Adjust the strike plate slightly if needed.',
      'If the door sticks from swelling, mark the rubbing area.',
      'Sand the marked area lightly.',
      'Wipe away dust and test again.',
      'Repeat small adjustments until it closes smoothly.',
    ],
    safetyNotes: 'Sand only a little at a time. Avoid forcing the door.',
    callProfessional: 'If the frame is warped or the door has major alignment issues.',
    ifixitUrl: 'https://www.ifixit.com/Search?query=door+won%27t+close',
  },
  {
    id: 'loose-doorknob',
    categoryId: 'home',
    subCategoryId: 'doors-windows',
    title: 'Loose doorknob',
    overview: 'A loose doorknob is usually caused by loosened screws or worn internal hardware.',
    tools: ['Screwdriver', 'replacement knob set if needed'],
    steps: [
      'Inspect the doorknob for visible screws.',
      'Tighten all accessible screws.',
      'Test the knob by turning and pulling it gently.',
      'Remove the knob if it still feels loose.',
      'Check the spindle and internal parts for damage.',
      'Reinstall the knob securely.',
      'Replace the knob set if the internal mechanism is worn out.',
      'Test opening and closing the door several times.',
    ],
    safetyNotes: 'Keep screws in one place so they do not get lost.',
    callProfessional: 'If the lock mechanism inside the door is damaged.',
    ifixitUrl: 'https://www.ifixit.com/Search?query=loose+doorknob',
  },
  {
    id: 'stuck-window',
    categoryId: 'home',
    subCategoryId: 'doors-windows',
    title: 'Stuck window',
    overview: 'A stuck window may be caused by paint, dirt buildup, or warped tracks.',
    tools: ['Putty knife', 'cloth', 'vacuum', 'lubricant'],
    steps: [
      'Inspect the edges of the window for paint sealing it shut.',
      'Run a putty knife carefully along the seams.',
      'Clean the window tracks with a cloth or vacuum.',
      'Apply a light lubricant to the tracks if appropriate.',
      'Try opening the window gently.',
      'Move it a little at a time instead of forcing it.',
      'Clean any extra debris from the frame.',
      'Test opening and closing repeatedly.',
    ],
    safetyNotes: 'Do not force glass windows hard. This can crack the glass.',
    callProfessional: 'If the frame is warped or the glass feels unstable.',
    ifixitUrl: 'https://www.ifixit.com/Search?query=stuck+window',
  },
  {
    id: 'broken-lock',
    categoryId: 'home',
    subCategoryId: 'doors-windows',
    title: 'Broken lock (basic)',
    overview: 'A simple broken lock may be caused by dirt, misalignment, or worn parts.',
    tools: ['Screwdriver', 'graphite lubricant', 'replacement lock if needed'],
    steps: [
      'Check whether the key turns at all.',
      'Try cleaning the keyhole with compressed air or graphite lubricant.',
      'Tighten the screws on the lock and strike plate.',
      'Test the door alignment.',
      'Remove the lock if it still does not work.',
      'Inspect for broken internal parts.',
      'Install a replacement lock if needed.',
      'Test locking and unlocking several times.',
    ],
    safetyNotes: 'Use dry graphite lubricant instead of oily products for locks.',
    callProfessional: 'If it is a security door lock or if you are locked out.',
  },
  {
    id: 'small-wall-cracks',
    categoryId: 'home',
    subCategoryId: 'walls-surfaces',
    title: 'Small wall cracks',
    overview: 'Small cracks are often cosmetic and can be patched easily.',
    tools: ['Putty knife', 'spackle or filler', 'sandpaper', 'paint'],
    steps: [
      'Clean the crack and remove loose dust.',
      'Use a putty knife to apply filler into the crack.',
      'Smooth the surface evenly.',
      'Let it dry fully.',
      'Sand the area lightly until smooth.',
      'Wipe away sanding dust.',
      'Repaint the area if needed.',
    ],
    safetyNotes: 'Wear a mask when sanding fine dust.',
    callProfessional: 'If cracks keep growing or appear near structural areas.',
  },
  {
    id: 'peeling-paint',
    categoryId: 'home',
    subCategoryId: 'walls-surfaces',
    title: 'Peeling paint',
    overview: 'Paint peels when moisture, poor surface prep, or old paint causes loss of adhesion.',
    tools: ['Scraper', 'sandpaper', 'primer', 'paintbrush', 'paint'],
    steps: [
      'Scrape off loose and peeling paint.',
      'Sand the edges smooth.',
      'Clean the wall surface.',
      'Check for moisture before repainting.',
      'Apply primer to the repaired area.',
      'Let the primer dry.',
      'Paint over the area evenly.',
      'Add a second coat if necessary.',
    ],
    safetyNotes: 'Fix any water source first before repainting.',
    callProfessional: 'If paint keeps peeling due to hidden moisture or mold.',
  },
  {
    id: 'hole-drywall',
    categoryId: 'home',
    subCategoryId: 'walls-surfaces',
    title: 'Hole in drywall',
    overview: 'Small drywall holes can be patched with filler or a repair patch.',
    tools: ['Putty knife', 'patch kit', 'filler', 'sandpaper', 'paint'],
    steps: [
      'Clean the damaged area.',
      'Trim away loose drywall edges.',
      'Apply a drywall patch if the hole is larger than a nail hole.',
      'Spread filler over the patch.',
      'Smooth it evenly with a putty knife.',
      'Let it dry fully.',
      'Sand until smooth.',
      'Apply another thin layer if needed.',
      'Prime and repaint the area.',
    ],
    safetyNotes: 'Do not overfill the hole too much or it will be harder to sand smooth.',
    callProfessional: 'If the hole is large or there may be wires or pipes behind the wall.',
  },
  {
    id: 'mold-spots',
    categoryId: 'home',
    subCategoryId: 'walls-surfaces',
    title: 'Mold spots',
    overview: 'Small mold spots on surfaces are often caused by moisture and poor ventilation.',
    tools: ['Gloves', 'mask', 'spray bottle', 'mild cleaner or vinegar', 'cloth'],
    steps: [
      'Wear gloves and a mask.',
      'Open windows or improve ventilation.',
      'Spray the affected area with vinegar or mild cleaner.',
      'Let it sit for several minutes.',
      'Wipe or scrub the mold spot gently.',
      'Dry the surface completely.',
      'Check the room for moisture sources.',
      'Improve airflow or fix leaks to prevent return.',
    ],
    safetyNotes: 'Do not handle large mold patches yourself. Avoid mixing bleach with other cleaners.',
    callProfessional: 'If mold covers a large area or keeps coming back.',
  },
  {
    id: 'light-not-working',
    categoryId: 'home',
    subCategoryId: 'electrical',
    title: 'Light not working',
    overview: 'A light that does not turn on may have a bad bulb, loose connection, or tripped breaker.',
    tools: ['Replacement bulb', 'voltage tester if available'],
    steps: [
      'Turn off the light switch.',
      'Let the bulb cool down if it was recently on.',
      'Remove the bulb and inspect for damage.',
      'Replace it with a working bulb of the correct type.',
      'Turn the switch on and test.',
      'If still not working, check whether other lights or outlets nearby work.',
      'Inspect the breaker panel for a tripped breaker.',
      'Reset the breaker once if needed.',
      'Test the light again.',
    ],
    safetyNotes: 'Do not touch exposed wires. Use dry hands.',
    callProfessional: 'If the fixture still does not work after changing the bulb and checking the breaker.',
  },
  {
    id: 'loose-outlet',
    categoryId: 'home',
    subCategoryId: 'electrical',
    title: 'Loose outlet',
    overview: 'A loose outlet may move in the wall or fail to hold plugs properly.',
    tools: ['Screwdriver', 'outlet shims or spacer if needed'],
    steps: [
      'Turn off power at the breaker.',
      'Confirm the outlet has no power.',
      'Remove the outlet cover plate.',
      'Check whether the outlet is loose in the wall box.',
      'Tighten mounting screws carefully.',
      'Use outlet spacers if the outlet sits too far back.',
      'Reattach the cover plate.',
      'Turn power back on and test the outlet.',
    ],
    safetyNotes: 'Never work on an outlet with power on.',
    callProfessional: 'If plugs spark, the outlet is warm, or wires look damaged.',
  },
  {
    id: 'tripped-breaker',
    categoryId: 'home',
    subCategoryId: 'electrical',
    title: 'Tripped breaker',
    overview: 'A breaker trips when a circuit is overloaded or there is a fault.',
    tools: ['Flashlight'],
    steps: [
      'Go to the breaker panel.',
      'Look for a breaker sitting between ON and OFF.',
      'Turn it fully OFF first.',
      'Then switch it back to ON.',
      'Unplug some devices from the affected circuit.',
      'Test whether power returns.',
      'Observe if the breaker trips again.',
      'If it does, stop using that circuit until checked.',
    ],
    safetyNotes: 'Stand on a dry surface. Do not keep resetting a breaker repeatedly.',
    callProfessional: 'If the breaker trips again right away or smells burnt.',
  },
  {
    id: 'bulb-flickering',
    categoryId: 'home',
    subCategoryId: 'electrical',
    title: 'Bulb flickering',
    overview: 'Flickering bulbs may be caused by loose bulbs, incompatible dimmers, or electrical issues.',
    tools: ['Replacement bulb', 'screwdriver if needed'],
    steps: [
      'Turn off the light switch.',
      'Let the bulb cool completely.',
      'Tighten the bulb gently.',
      'Turn the light back on and test.',
      'If still flickering, try a new bulb.',
      'If using a dimmer, check whether the bulb supports dimming.',
      'Replace the dimmer-compatible bulb if needed.',
      'If multiple lights flicker, inspect the breaker or call for help.',
    ],
    safetyNotes: 'Never overtighten a bulb.',
    callProfessional: 'If multiple fixtures flicker or you notice burning smells.',
  },
  // APPLIANCES
  {
    id: 'wm-not-draining',
    categoryId: 'appliances',
    subCategoryId: 'washing-machine',
    title: 'Not draining',
    overview: 'Water stays in the drum after a cycle, usually caused by a clogged drain hose or pump.',
    tools: ['Bucket', 'towel', 'screwdriver'],
    steps: [
      'Turn off and unplug the washing machine.',
      'Check the drain hose at the back for kinks or bends.',
      'Place a bucket under the hose and disconnect it.',
      'Let water drain out completely.',
      'Inspect the hose for clogs and remove debris.',
      'Check the drain pump filter (usually at the front bottom panel).',
      'Clean any lint, coins, or dirt inside the filter.',
      'Reconnect everything securely.',
      'Run a short cycle to test.',
    ],
    safetyNotes: 'Always unplug before opening any panel.',
    callProfessional: 'If the pump is not working or makes unusual noises.',
  },
  {
    id: 'wm-not-spinning',
    categoryId: 'appliances',
    subCategoryId: 'washing-machine',
    title: 'Not spinning',
    overview: 'Clothes stay wet because the drum does not spin properly.',
    tools: ['None (basic check)'],
    steps: [
      'Check if the load is too heavy or uneven.',
      'Redistribute clothes evenly inside the drum.',
      'Close the door properly until it locks.',
      'Restart the spin cycle.',
      'Listen for motor sounds.',
      'Check if the lid switch is working (top-load units).',
      'Ensure the machine is level on the floor.',
    ],
    safetyNotes: 'Avoid overloading the machine.',
    callProfessional: 'If motor or belt issues are suspected.',
  },
  {
    id: 'wm-leaking',
    categoryId: 'appliances',
    subCategoryId: 'washing-machine',
    title: 'Leaking water',
    overview: 'Water leaking from the machine may come from hoses or seals.',
    tools: ['Cloth', 'wrench'],
    steps: [
      'Turn off water supply.',
      'Check inlet hoses for cracks or loose connections.',
      'Tighten hose connections gently.',
      'Inspect door seal (front load) for damage or dirt.',
      'Clean the seal and remove debris.',
      'Check detergent drawer for overflow.',
      'Run a short cycle and observe leak source.',
    ],
    safetyNotes: 'Dry the area to prevent slipping.',
    callProfessional: 'If leak comes from inside the machine.',
  },
  {
    id: 'wm-making-noise',
    categoryId: 'appliances',
    subCategoryId: 'washing-machine',
    title: 'Making noise',
    overview: 'Loud sounds may come from objects stuck inside or worn parts.',
    tools: ['None'],
    steps: [
      'Stop the machine immediately.',
      'Check inside drum for coins or objects.',
      'Inspect drum for imbalance.',
      'Ensure machine is level.',
      'Run empty spin cycle to test.',
      'Listen if noise persists.',
    ],
    safetyNotes: 'Do not ignore loud grinding sounds.',
    callProfessional: 'If noise comes from motor or bearings.',
  },
  {
    id: 'fridge-not-cooling',
    categoryId: 'appliances',
    subCategoryId: 'refrigerator',
    title: 'Not cooling',
    overview: 'Food is not staying cold due to airflow or compressor issues.',
    tools: ['Brush', 'cloth'],
    steps: [
      'Check thermostat setting.',
      'Ensure fridge door is fully closed.',
      'Clean door seals.',
      'Inspect vents inside for blockage.',
      'Clean condenser coils at the back.',
      'Leave space around fridge for airflow.',
      'Plug back and monitor temperature.',
    ],
    safetyNotes: 'Unplug before cleaning coils.',
    callProfessional: 'If compressor is not running.',
  },
  {
    id: 'fridge-leaking',
    categoryId: 'appliances',
    subCategoryId: 'refrigerator',
    title: 'Water leaking',
    overview: 'Water pooling inside or under fridge.',
    tools: ['Warm water', 'cloth'],
    steps: [
      'Check drain hole inside fridge.',
      'Clear blockage using warm water.',
      'Clean drip tray at the back.',
      'Inspect door seals for gaps.',
      'Wipe excess moisture.',
    ],
    safetyNotes: 'Avoid sharp tools when clearing drain.',
    callProfessional: 'If leak continues after cleaning.',
  },
  {
    id: 'fridge-ice-buildup',
    categoryId: 'appliances',
    subCategoryId: 'refrigerator',
    title: 'Ice buildup',
    overview: 'Excess frost inside freezer.',
    tools: ['Cloth', 'warm water'],
    steps: [
      'Turn off and unplug fridge.',
      'Remove food items.',
      'Let ice melt naturally.',
      'Wipe interior dry.',
      'Check door seals for leaks.',
      'Restart fridge.',
    ],
    safetyNotes: 'Do not chip ice with sharp tools.',
    callProfessional: 'If frost returns quickly.',
  },
  {
    id: 'fridge-smell',
    categoryId: 'appliances',
    subCategoryId: 'refrigerator',
    title: 'Strange smell',
    overview: 'Bad odor from spoiled food or bacteria.',
    tools: ['Baking soda', 'cloth'],
    steps: [
      'Remove all expired food.',
      'Wipe shelves with mild cleaner.',
      'Place baking soda inside fridge.',
      'Check drain area for buildup.',
      'Keep fridge organized.',
    ],
    safetyNotes: 'Dispose spoiled food properly.',
    callProfessional: 'If smell persists without visible cause.',
  },
  {
    id: 'ac-weak-airflow',
    categoryId: 'appliances',
    subCategoryId: 'air-conditioner',
    title: 'Weak airflow',
    overview: 'Air is coming out but not strong.',
    tools: ['Cloth', 'brush'],
    steps: [
      'Turn off AC unit.',
      'Remove and clean air filter.',
      'Check vents for blockage.',
      'Ensure nothing blocks airflow.',
      'Turn unit back on and test.',
    ],
    safetyNotes: 'Clean filters regularly.',
    callProfessional: 'If fan motor is weak.',
  },
  {
    id: 'ac-not-cooling',
    categoryId: 'appliances',
    subCategoryId: 'air-conditioner',
    title: 'Not cooling',
    overview: 'AC runs but air is not cold.',
    tools: ['None'],
    steps: [
      'Set thermostat to lower temperature.',
      'Check if filters are dirty.',
      'Ensure windows and doors are closed.',
      'Inspect outdoor unit for obstruction.',
      'Restart the unit.',
    ],
    safetyNotes: 'Avoid opening unit internals.',
    callProfessional: 'Possible refrigerant issue.',
  },
  {
    id: 'ac-dirty-filter',
    categoryId: 'appliances',
    subCategoryId: 'air-conditioner',
    title: 'Dirty filter',
    overview: 'Dust buildup reduces performance.',
    tools: ['Water', 'brush'],
    steps: [
      'Turn off AC.',
      'Remove filter.',
      'Wash with water.',
      'Let it dry completely.',
      'Reinstall filter.',
    ],
    safetyNotes: 'Never install wet filter.',
    callProfessional: 'If airflow still weak after cleaning.',
  },
  {
    id: 'ac-water-dripping',
    categoryId: 'appliances',
    subCategoryId: 'air-conditioner',
    title: 'Water dripping',
    overview: 'Water leaks from AC unit.',
    tools: ['Cloth', 'pipe cleaner'],
    steps: [
      'Turn off unit.',
      'Check drain pipe for clog.',
      'Clean pipe gently.',
      'Ensure unit is level.',
      'Restart AC.',
    ],
    safetyNotes: 'Avoid electrical contact with water.',
    callProfessional: 'If internal leak persists.',
  },
  {
    id: 'microwave-not-heating',
    categoryId: 'appliances',
    subCategoryId: 'kitchen-appliances',
    title: 'Microwave not heating',
    overview: 'Microwave runs but food stays cold.',
    tools: ['None'],
    steps: [
      'Check power supply.',
      'Ensure door closes properly.',
      'Test with different outlet.',
      'Try different food item.',
      'Listen for unusual sounds.',
    ],
    safetyNotes: 'Do not open internal parts.',
    callProfessional: 'Magnetron issue suspected.',
  },
  {
    id: 'rice-cooker',
    categoryId: 'appliances',
    subCategoryId: 'kitchen-appliances',
    title: 'Rice cooker not turning on',
    overview: 'No power or indicator light.',
    tools: ['None'],
    steps: [
      'Check power cord.',
      'Try different outlet.',
      'Inspect inner pot placement.',
      'Ensure lid is properly closed.',
      'Reset if possible.',
    ],
    safetyNotes: 'Do not use damaged cord.',
    callProfessional: 'Internal wiring issue.',
  },
  {
    id: 'induction-pan',
    categoryId: 'appliances',
    subCategoryId: 'kitchen-appliances',
    title: 'Induction not detecting pan',
    overview: 'Stove does not recognize cookware.',
    tools: ['Compatible cookware'],
    steps: [
      'Check if pan is induction-compatible.',
      'Place pan properly centered.',
      'Clean stove surface.',
      'Restart induction unit.',
      'Test with another pan.',
    ],
    safetyNotes: 'Use flat-bottom cookware only.',
    callProfessional: 'If no cookware is detected at all.',
  },
  // CAR
  {
    id: 'battery-corrosion',
    categoryId: 'car',
    subCategoryId: 'battery',
    title: 'Corrosion cleaning',
    overview: 'White or blue buildup on battery terminals can block electrical flow.',
    tools: ['Gloves', 'baking soda', 'water', 'toothbrush', 'cloth'],
    steps: [
      'Turn off the engine completely.',
      'Open the hood and locate the battery.',
      'Disconnect the negative (-) terminal first, then the positive (+).',
      'Mix baking soda with a small amount of water.',
      'Apply the solution to corroded areas.',
      'Scrub gently with a toothbrush.',
      'Wipe away residue with a cloth.',
      'Let terminals dry completely.',
      'Reconnect positive (+) first, then negative (-).',
      'Start the car to test.',
    ],
    safetyNotes: 'Avoid touching both terminals at the same time.',
    callProfessional: 'If corrosion keeps coming back quickly.',
  },
  {
    id: 'dead-battery',
    categoryId: 'car',
    subCategoryId: 'battery',
    title: 'Dead battery',
    overview: 'The car will not start due to no battery charge.',
    tools: ['Jumper cables or portable jump starter'],
    steps: [
      'Turn the key or press start to confirm no power.',
      'Check headlights or dashboard for signs of power.',
      'Connect jumper cables to another car (positive to positive).',
      'Connect negative to a metal ground on your car.',
      'Start the donor car.',
      'Wait 2–3 minutes.',
      'Try starting your car.',
      'Remove cables in reverse order.',
      'Let your engine run for at least 10–15 minutes.',
    ],
    safetyNotes: 'Do not connect cables incorrectly.',
    callProfessional: 'If the battery dies frequently.',
  },
  {
    id: 'loose-terminals',
    categoryId: 'car',
    subCategoryId: 'battery',
    title: 'Loose terminals',
    overview: 'Battery connections are not tight, causing power issues.',
    tools: ['Wrench'],
    steps: [
      'Turn off the engine.',
      'Check battery terminals for movement.',
      'Tighten the terminal clamps using a wrench.',
      'Ensure cables are secure.',
      'Try starting the car again.',
    ],
    safetyNotes: 'Do not overtighten.',
    callProfessional: 'If terminals are damaged or worn.',
  },
  {
    id: 'flat-tire',
    categoryId: 'car',
    subCategoryId: 'tires',
    title: 'Flat tire',
    overview: 'Tire loses air completely and needs replacement.',
    tools: ['Jack', 'spare tire', 'lug wrench'],
    steps: [
      'Park on a flat, safe surface.',
      'Turn on hazard lights.',
      'Loosen lug nuts slightly.',
      'Use jack to lift the car.',
      'Remove lug nuts completely.',
      'Take off the flat tire.',
      'Install spare tire.',
      'Tighten lug nuts by hand.',
      'Lower the car.',
      'Fully tighten lug nuts.',
    ],
    safetyNotes: 'Never go under the car while using a jack.',
    callProfessional: 'If you do not have tools or it is unsafe.',
  },
  {
    id: 'low-pressure',
    categoryId: 'car',
    subCategoryId: 'tires',
    title: 'Low pressure',
    overview: 'Tire has less air than recommended.',
    tools: ['Air pump', 'tire pressure gauge'],
    steps: [
      'Check recommended PSI (on door frame).',
      'Remove valve cap.',
      'Measure current pressure.',
      'Add air using a pump.',
      'Recheck pressure.',
      'Replace valve cap.',
    ],
    safetyNotes: 'Do not overinflate.',
    callProfessional: 'If tire loses air frequently.',
  },
  {
    id: 'uneven-wear',
    categoryId: 'car',
    subCategoryId: 'tires',
    title: 'Uneven wear',
    overview: 'Tires wear out unevenly due to alignment or pressure issues.',
    tools: ['Visual inspection'],
    steps: [
      'Inspect tire surface for uneven patterns.',
      'Check tire pressure on all tires.',
      'Rotate tires if needed.',
      'Monitor driving behavior (avoid hard braking).',
      'Schedule alignment check.',
    ],
    safetyNotes: 'Worn tires reduce safety.',
    callProfessional: 'If wear is severe.',
  },
  {
    id: 'low-engine-oil',
    categoryId: 'car',
    subCategoryId: 'fluids',
    title: 'Low engine oil',
    overview: 'Engine oil level is below safe range.',
    tools: ['Clean cloth'],
    steps: [
      'Turn off engine and wait a few minutes.',
      'Pull out dipstick.',
      'Wipe it clean.',
      'Insert again fully.',
      'Pull out and check oil level.',
      'Add oil if below minimum mark.',
      'Recheck level.',
    ],
    safetyNotes: 'Use correct oil type.',
    callProfessional: 'If oil level drops quickly.',
  },
  {
    id: 'coolant-check',
    categoryId: 'car',
    subCategoryId: 'fluids',
    title: 'Coolant check',
    overview: 'Coolant prevents engine overheating.',
    tools: ['None'],
    steps: [
      'Wait for engine to cool completely.',
      'Open hood.',
      'Locate coolant reservoir.',
      'Check level against markings.',
      'Add coolant if needed.',
    ],
    safetyNotes: 'Never open when engine is hot.',
    callProfessional: 'If coolant leaks.',
  },
  {
    id: 'brake-fluid',
    categoryId: 'car',
    subCategoryId: 'fluids',
    title: 'Brake fluid basics',
    overview: 'Brake fluid is essential for braking performance.',
    tools: ['None'],
    steps: [
      'Locate brake fluid reservoir.',
      'Check fluid level.',
      'Ensure it is within safe range.',
      'Observe fluid color (should be clear/light).',
      'Close reservoir securely.',
    ],
    safetyNotes: 'Avoid spilling fluid on paint.',
    callProfessional: 'If brakes feel soft or fluid is low.',
  },
  {
    id: 'car-wont-start',
    categoryId: 'car',
    subCategoryId: 'car-basics',
    title: "Car won't start",
    overview: 'Car fails to start due to battery or fuel issues.',
    tools: ['None initially'],
    steps: [
      'Turn key and observe response.',
      'Check dashboard lights.',
      'Listen for clicking sound.',
      'Check fuel level.',
      'Try jumpstarting if needed.',
      'Wait and try again.',
    ],
    safetyNotes: 'Do not keep cranking engine repeatedly.',
    callProfessional: 'If issue persists.',
  },
  {
    id: 'jumpstart',
    categoryId: 'car',
    subCategoryId: 'car-basics',
    title: 'Jumpstart guide',
    overview: 'Use another battery to start your car.',
    tools: ['Jumper cables'],
    steps: [
      'Park cars close but not touching.',
      'Turn off both engines.',
      'Connect positive to positive.',
      'Connect negative to donor car.',
      'Connect other negative to metal ground.',
      'Start donor car.',
      'Start your car.',
      'Remove cables carefully.',
    ],
    safetyNotes: 'Follow correct cable order.',
    callProfessional: 'If unsure or battery is damaged.',
  },
  {
    id: 'warning-lights',
    categoryId: 'car',
    subCategoryId: 'car-basics',
    title: 'Warning lights (basic meaning)',
    overview: 'Dashboard lights indicate system issues.',
    tools: ['None'],
    steps: [
      'Observe which light is on.',
      'Check manual for symbol meaning.',
      'Identify if it is urgent (red) or caution (yellow).',
      'Reduce driving if needed.',
      'Monitor for changes.',
    ],
    safetyNotes: 'Do not ignore red warning lights.',
    callProfessional: 'Immediately for critical warnings.',
  },
  // ELECTRONICS
  {
    id: 'phone-not-charging',
    categoryId: 'electronics',
    subCategoryId: 'phone',
    title: 'Not charging',
    overview: 'Phone does not charge due to cable, port, or adapter issues.',
    tools: ['Cloth', 'toothpick (or soft tool)', 'different charger'],
    steps: [
      'Check if the charging cable is properly connected.',
      'Try a different cable and adapter.',
      'Inspect the charging port for dust or debris.',
      'Gently clean the port using a toothpick or soft brush.',
      'Plug the charger back in securely.',
      'Restart the phone.',
      'Test charging again.',
    ],
    safetyNotes: 'Do not use metal objects to clean the port.',
    callProfessional: 'If port is loose or damaged.',
  },
  {
    id: 'phone-overheating',
    categoryId: 'electronics',
    subCategoryId: 'phone',
    title: 'Overheating',
    overview: 'Phone gets too hot due to heavy usage or background apps.',
    tools: ['None'],
    steps: [
      'Stop using the phone temporarily.',
      'Remove phone case.',
      'Close all running apps.',
      'Turn off unused features (Bluetooth, GPS).',
      'Move phone to a cool place.',
      'Restart the device.',
      'Avoid charging while using heavily.',
    ],
    safetyNotes: 'Do not put phone in fridge or freezer.',
    callProfessional: 'If overheating happens frequently.',
  },
  {
    id: 'slow-performance',
    categoryId: 'electronics',
    subCategoryId: 'phone',
    title: 'Slow performance',
    overview: 'Phone becomes laggy due to storage or background processes.',
    tools: ['None'],
    steps: [
      'Restart the phone.',
      'Close unused apps.',
      'Check storage and delete unnecessary files.',
      'Clear app cache.',
      'Update system software.',
      'Disable heavy background apps.',
      'Test performance again.',
    ],
    safetyNotes: 'Avoid installing unknown apps.',
    callProfessional: 'If phone is still very slow after cleanup.',
  },
  {
    id: 'laptop-overheating',
    categoryId: 'electronics',
    subCategoryId: 'laptop',
    title: 'Overheating',
    overview: 'Laptop gets hot due to dust or blocked airflow.',
    tools: ['Brush', 'cloth'],
    steps: [
      'Turn off the laptop.',
      'Place it on a flat surface.',
      'Check air vents for dust.',
      'Clean vents gently with a brush.',
      'Avoid using laptop on soft surfaces (bed, pillow).',
      'Turn it back on.',
      'Monitor temperature during use.',
    ],
    safetyNotes: 'Do not open internal parts unless experienced.',
    callProfessional: 'If fan is noisy or overheating persists.',
  },
  {
    id: 'laptop-not-turning-on',
    categoryId: 'electronics',
    subCategoryId: 'laptop',
    title: 'Not turning on',
    overview: 'Laptop does not power on due to battery or power issues.',
    tools: ['Charger'],
    steps: [
      'Plug in the charger.',
      'Check charging light indicator.',
      'Try a different outlet.',
      'Hold power button for 10–15 seconds.',
      'Remove external devices.',
      'Try powering on again.',
    ],
    safetyNotes: 'Do not force power button repeatedly.',
    callProfessional: 'If no signs of power at all.',
  },
  {
    id: 'battery-draining',
    categoryId: 'electronics',
    subCategoryId: 'laptop',
    title: 'Battery draining fast',
    overview: 'Battery runs out quickly due to apps or aging battery.',
    tools: ['None'],
    steps: [
      'Lower screen brightness.',
      'Close unused apps.',
      'Turn off background apps.',
      'Enable battery saver mode.',
      'Check battery usage in settings.',
      'Update system software.',
      'Test battery life again.',
    ],
    safetyNotes: 'Avoid using non-original chargers.',
    callProfessional: 'If battery health is very low.',
  },
  {
    id: 'no-internet',
    categoryId: 'electronics',
    subCategoryId: 'internet-router',
    title: 'No internet',
    overview: 'Device connected but no internet access.',
    tools: ['None'],
    steps: [
      'Check if other devices have internet.',
      'Restart your router.',
      'Wait 2–3 minutes.',
      'Reconnect to Wi-Fi.',
      'Check modem cables.',
      'Contact ISP if issue continues.',
    ],
    safetyNotes: 'Avoid unplugging frequently.',
    callProfessional: 'If internet is down for long time.',
  },
  {
    id: 'slow-connection',
    categoryId: 'electronics',
    subCategoryId: 'internet-router',
    title: 'Slow connection',
    overview: 'Internet is working but very slow.',
    tools: ['None'],
    steps: [
      'Move closer to router.',
      'Restart router.',
      'Disconnect unused devices.',
      'Pause downloads or streaming.',
      'Check internet speed.',
      'Switch to less crowded network band.',
    ],
    safetyNotes: 'Avoid overheating router.',
    callProfessional: 'If speed is consistently slow.',
  },
  {
    id: 'router-reset',
    categoryId: 'electronics',
    subCategoryId: 'internet-router',
    title: 'Router reset',
    overview: 'Resetting router can fix connectivity issues.',
    tools: ['Pin or small object'],
    steps: [
      'Locate reset button on router.',
      'Press and hold for 10–15 seconds.',
      'Wait for router to restart.',
      'Reconnect using Wi-Fi credentials.',
      'Test internet connection.',
    ],
    safetyNotes: 'Reset removes saved settings.',
    callProfessional: 'If reset does not fix issue.',
  },
  {
    id: 'broken-charger',
    categoryId: 'electronics',
    subCategoryId: 'power-issues',
    title: 'Broken charger',
    overview: 'Charger not working due to cable damage or adapter failure.',
    tools: ['Replacement charger'],
    steps: [
      'Inspect cable for visible damage.',
      'Try charger on another device.',
      'Test device with different charger.',
      'Replace faulty charger.',
      'Avoid bending cable excessively.',
    ],
    safetyNotes: 'Do not use damaged chargers.',
    callProfessional: 'If device still does not charge.',
  },
  {
    id: 'extension-not-working',
    categoryId: 'electronics',
    subCategoryId: 'power-issues',
    title: 'Extension not working',
    overview: 'Power strip or extension cord not supplying power.',
    tools: ['None'],
    steps: [
      'Check if extension is plugged in properly.',
      'Test with another device.',
      'Inspect for damage or burn marks.',
      'Try a different outlet.',
      'Replace if faulty.',
    ],
    safetyNotes: 'Avoid overloading extension.',
    callProfessional: 'If outlet itself is faulty.',
  },
  {
    id: 'loose-plug',
    categoryId: 'electronics',
    subCategoryId: 'power-issues',
    title: 'Loose plug',
    overview: 'Plug does not stay firmly in outlet.',
    tools: ['None'],
    steps: [
      'Check if plug fits properly.',
      'Try a different outlet.',
      'Inspect outlet for looseness.',
      'Avoid forcing plug.',
      'Replace outlet if needed.',
    ],
    safetyNotes: 'Loose outlets can be dangerous.',
    callProfessional: 'If sparks or heat are present.',
  },
];

export function findGuideContent(id: string): GuideContent | undefined {
  return GUIDE_CONTENTS.find((g) => g.id === id);
}

export function searchGuideContents(query: string): GuideContent[] {
  const q = query.toLowerCase().trim();
  if (!q) return GUIDE_CONTENTS;
  return GUIDE_CONTENTS.filter(
    (g) =>
      g.title.toLowerCase().includes(q) ||
      g.overview.toLowerCase().includes(q) ||
      g.subCategoryId.toLowerCase().includes(q) ||
      g.categoryId.toLowerCase().includes(q)
  );
}

export interface ScoredGuide extends GuideContent {
  score: number;
  confidence: 'high' | 'medium' | 'low';
}

const STOP_WORDS = new Set([
  'not', 'the', 'and', 'for', 'but', 'with', 'from', 'that', 'this', 'what',
  'how', 'why', 'when', 'where', 'who', 'which', 'have', 'has', 'had', 'was',
  'were', 'been', 'being', 'are', 'is', 'does', 'did', 'can', 'could', 'would',
  'should', 'will', 'shall', 'may', 'might', 'must', 'need', 'know', 'think',
  'something', 'someone', 'somewhere', 'anything', 'anyone', 'everything',
  'everyone', 'problem', 'issue', 'help', 'fix', 'repair', 'working', 'work',
  'want', 'like', 'get', 'use', 'using', 'make', 'making', 'doing', 'do',
  'try', 'trying', 'see', 'seen', 'look', 'looking', 'find', 'found',
]);

function isStopWord(word: string): boolean {
  return STOP_WORDS.has(word.toLowerCase()) || word.length <= 2;
}

function normalizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !isStopWord(w));
}

export function findBestGuides(query: string, limit = 3): ScoredGuide[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  // Extract meaningful keywords (filter stop words and short words)
  const tokens = normalizeQuery(q);
  if (tokens.length === 0) return [];

  // Also keep the original full phrase for exact matching
  const fullPhrase = q.replace(/[^a-z0-9\s]/g, ' ').trim();

  const scored = GUIDE_CONTENTS.map((g) => {
    let score = 0;
    const title = g.title.toLowerCase();
    const overview = g.overview.toLowerCase();
    const subCat = g.subCategoryId.toLowerCase().replace(/-/g, ' ');
    const steps = g.steps.join(' ').toLowerCase();

    // --- EXACT / PHRASE MATCHES (highest confidence) ---

    // Exact title match
    if (title === q) score += 200;
    else if (title === fullPhrase) score += 180;
    else if (title.includes(q)) score += 120;
    else if (fullPhrase.length > 4 && title.includes(fullPhrase)) score += 100;

    // Token-by-token in title (weighted by position - earlier = better)
    const titleTokens = title.split(/\s+/).filter((w) => !isStopWord(w));
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      // Exact token match in title
      if (titleTokens.some((t) => t === token)) {
        score += 40;
        // Bonus if it's the start of the title (most important word)
        if (title.startsWith(token) || title.includes(' ' + token)) score += 15;
      }
      // Partial match in title
      else if (title.includes(token)) {
        score += 15;
      }
      // Fuzzy match for compound words
      else if (token.length > 5 && titleTokens.some((t) => t.includes(token) || token.includes(t))) {
        score += 8;
      }
    }

    // Multiple tokens in title = big bonus
    const titleMatchCount = tokens.filter((t) => title.includes(t)).length;
    if (titleMatchCount >= 2) score += 30;
    if (titleMatchCount >= 3) score += 40;

    // --- OVERVIEW MATCHES ---
    for (const token of tokens) {
      if (overview.includes(token)) score += 12;
      // Bonus for overview phrase match
      if (overview.includes(token + ' ')) score += 5;
    }
    // Full phrase in overview
    if (overview.includes(q)) score += 25;
    if (overview.includes(fullPhrase) && fullPhrase.length > 5) score += 20;

    // --- SUBCATEGORY MATCHES ---
    const subCatTokens = subCat.split(/\s+/);
    for (const token of tokens) {
      if (subCatTokens.some((t) => t === token)) score += 20;
      else if (subCat.includes(token)) score += 8;
    }

    // --- STEP CONTENT MATCHES (lowest weight) ---
    for (const token of tokens) {
      if (steps.includes(token)) score += 5;
    }

    // --- CATEGORY KEYWORD BONUSES ---
    const categoryKeywords: Record<string, string[]> = {
      home: ['faucet', 'pipe', 'toilet', 'sink', 'shower', 'drain', 'leak', 'water', 'plumbing', 'door', 'window', 'hinge', 'lock', 'wall', 'paint', 'drywall', 'crack', 'mold', 'light', 'bulb', 'outlet', 'breaker', 'electric', 'electrical', 'wiring'],
      appliances: ['washer', 'washing', 'fridge', 'refrigerator', 'freezer', 'ac', 'air', 'conditioner', 'microwave', 'rice', 'induction', 'cooker', 'filter', 'spin', 'leaking', 'cooling'],
      car: ['car', 'battery', 'tire', 'flat', 'oil', 'engine', 'coolant', 'brake', 'jumpstart', 'jump', 'warning', 'dashboard'],
      electronics: ['phone', 'laptop', 'internet', 'router', 'wifi', 'charge', 'charger', 'screen', 'plug', 'extension', 'power'],
    };

    const catKeywords = categoryKeywords[g.categoryId] || [];
    let catMatchCount = 0;
    for (const token of tokens) {
      if (catKeywords.some((k) => k === token || k.includes(token) || token.includes(k))) {
        score += 6;
        catMatchCount++;
      }
    }
    // Bonus for matching multiple category keywords
    if (catMatchCount >= 2) score += 15;

    // --- PENALTIES to reduce false positives ---

    // If query has specific keywords that DON'T appear at all in the guide, penalize
    for (const token of tokens) {
      const allContent = `${title} ${overview} ${subCat} ${steps}`;
      if (!allContent.includes(token)) {
        // If a meaningful keyword is completely absent, this is probably not relevant
        score -= 15;
      }
    }

    // If no title match at all and only 1 token matches in overview, likely a weak match
    const hasTitleMatch = tokens.some((t) => title.includes(t));
    if (!hasTitleMatch && titleMatchCount === 0) {
      // Require stronger evidence elsewhere
      if (score < 30) score = Math.max(0, score - 10);
    }

    // --- CONFIDENCE LEVEL ---
    let confidence: 'high' | 'medium' | 'low' = 'low';
    if (score >= 80) confidence = 'high';
    else if (score >= 35) confidence = 'medium';
    else confidence = 'low';

    return { ...g, score, confidence };
  });

  // Only return results with meaningful confidence
  const MIN_SCORE = 20;
  return scored
    .filter((g) => g.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getSuggestedCategories(query: string): string[] {
  const q = query.toLowerCase();
  const suggestions: string[] = [];
  const cats = [
    { id: 'home', keywords: ['faucet', 'pipe', 'toilet', 'sink', 'shower', 'drain', 'leak', 'water', 'door', 'window', 'wall', 'paint', 'light', 'outlet', 'breaker'] },
    { id: 'appliances', keywords: ['washer', 'fridge', 'ac', 'microwave', 'cooker', 'induction'] },
    { id: 'car', keywords: ['car', 'battery', 'tire', 'oil', 'engine', 'coolant', 'brake'] },
    { id: 'electronics', keywords: ['phone', 'laptop', 'internet', 'router', 'wifi', 'charge', 'charger', 'screen'] },
  ];
  for (const cat of cats) {
    if (cat.keywords.some((k) => q.includes(k))) suggestions.push(cat.id);
  }
  return suggestions;
}
