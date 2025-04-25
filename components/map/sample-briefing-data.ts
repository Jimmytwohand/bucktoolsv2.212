import type { MapBriefing } from "@/contexts/map-context"

export const sampleBriefingData: MapBriefing = {
  id: "sample-briefing-1",
  mapId: "1", // Gettysburg map ID
  title: "Battle of Gettysburg - July 1-3, 1863",
  author: "Military Historian",
  createdAt: new Date("2023-10-15").toISOString(),
  updatedAt: new Date("2023-11-20").toISOString(),
  sections: [
    {
      id: "intro",
      title: "Introduction",
      order: 1,
      content: `
        <p>The Battle of Gettysburg was fought July 1–3, 1863, in and around the town of Gettysburg, Pennsylvania, by Union and Confederate forces during the American Civil War. The battle involved the largest number of casualties of the entire war and is often described as the war's turning point.</p>
        <p>Union Maj. Gen. George Meade's Army of the Potomac defeated attacks by Confederate Gen. Robert E. Lee's Army of Northern Virginia, halting Lee's invasion of the North.</p>
        <p>Click on [location: 400,300, 50]Cemetery Ridge[/location] to see the Union defensive position that played a crucial role in the battle's outcome.</p>
      `,
    },
    {
      id: "day1",
      title: "Day 1: July 1",
      order: 2,
      content: `
        <p>The first day's fighting (July 1) was initiated by a chance encounter between Confederate infantry and Union cavalry pickets [location: 200,150, 40]northwest of the town[/location]. As the fighting began, the Union forces were initially outnumbered and driven back through the streets of Gettysburg.</p>
        <p>By the end of the day, the Union forces had retreated to defensive positions on [location: 450,350, 60]Cemetery Hill[/location] and [location: 500,400, 40]Culp's Hill[/location], forming what would become known as the "fishhook" line.</p>
      `,
    },
    {
      id: "day2",
      title: "Day 2: July 2",
      order: 3,
      content: `
        <p>On the second day of battle (July 2), Lee attempted to envelop the Union positions with attacks on both flanks. The fighting was particularly fierce at [location: 600,450, 40]Little Round Top[/location], the [location: 550,500, 30]Wheatfield[/location], the [location: 520,480, 30]Peach Orchard[/location], and [location: 480,420, 30]Cemetery Hill[/location].</p>
        <p>The Union left flank was defended by Col. Joshua Chamberlain and the 20th Maine Regiment at Little Round Top, where they successfully repelled multiple Confederate assaults before executing a desperate bayonet charge.</p>
      `,
    },
    {
      id: "day3",
      title: "Day 3: July 3",
      order: 4,
      content: `
        <p>The third day (July 3) featured the famous "Pickett's Charge," a massive Confederate infantry assault on the Union center at [location: 400,350, 70]Cemetery Ridge[/location]. The charge was preceded by a massive artillery bombardment but ultimately failed with severe Confederate casualties.</p>
        <p>Approximately 12,500 Confederate soldiers advanced across open fields toward the Union position in what would become known as the "High Water Mark of the Confederacy" - the closest the Confederate forces ever came to military victory over the Union.</p>
      `,
    },
    {
      id: "aftermath",
      title: "Aftermath",
      order: 5,
      content: `
        <p>The battle resulted in 23,000 Union casualties and 28,000 Confederate casualties. Lee's army retreated back to Virginia on July 4, the same day that the Union captured Vicksburg in the Western Theater.</p>
        <p>The battlefield became the site of President Abraham Lincoln's Gettysburg Address, delivered at the dedication of the Soldiers' National Cemetery on November 19, 1863.</p>
        <p>The Union victory at Gettysburg, coupled with the fall of Vicksburg, marked a major turning point in the Civil War, after which the Confederacy's prospects for independence diminished rapidly.</p>
      `,
    },
  ],
  strategicLocations: [
    {
      id: "cemetery-ridge",
      name: "Cemetery Ridge",
      description:
        "A critical defensive position for the Union Army, Cemetery Ridge was the site of Pickett's Charge on July 3rd and formed the center of the Union's 'fishhook' line.",
      imageUrl: "https://i.imgur.com/JVUmFRF.jpg",
      coordinates: { x: 400, y: 350 },
      highlightRadius: 50,
    },
    {
      id: "little-round-top",
      name: "Little Round Top",
      description:
        "A hill that was the site of an intense battle on July 2nd. Colonel Joshua Chamberlain's 20th Maine Regiment made a famous bayonet charge here to defend the Union's left flank.",
      imageUrl: "https://i.imgur.com/8cTW5lj.jpg",
      coordinates: { x: 600, y: 450 },
      highlightRadius: 40,
    },
    {
      id: "peach-orchard",
      name: "The Peach Orchard",
      description:
        "An area of the battlefield where Union General Daniel Sickles moved his troops forward without orders, creating a salient in the Union line that was vulnerable to Confederate attack.",
      imageUrl: "https://i.imgur.com/QZW0Cdt.jpg",
      coordinates: { x: 520, y: 480 },
      highlightRadius: 30,
    },
    {
      id: "seminary-ridge",
      name: "Seminary Ridge",
      description:
        "The Confederate position during much of the battle, named for the Lutheran seminary located there. It was from here that Pickett's Charge was launched on July 3rd.",
      imageUrl:
        "https://sjc.microlink.io/Ia_L6ruI59_DBgoW9YG5kC4Ep79DasNN9ViZNGs6t6Em4ZbXbhIU5RBwh1Cs4CUVQVm6HG1g94DXVzmiWeFbCg.jpeg",
      coordinates: { x: 300, y: 300 },
      highlightRadius: 45,
    },
  ],
}
