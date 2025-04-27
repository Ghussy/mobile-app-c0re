import { getDiscordUserData } from "@/lib/supabase";

export async function testDiscordGuildAccess() {
  try {
    const { guilds } = await getDiscordUserData();

    if (!guilds || guilds.length === 0) {
      console.log(
        "No guilds found. Make sure you've granted the 'guilds' permission during Discord login."
      );
      return null;
    }

    console.log(`Found ${guilds.length} Discord servers:`);
    guilds.forEach((guild) => {
      console.log(`- ${guild.name} (${guild.id})`);
      console.log(`  Owner: ${guild.owner}, Permissions: ${guild.permissions}`);
    });

    return guilds;
  } catch (error) {
    console.error("Error accessing Discord guilds:", error);
    return null;
  }
}
