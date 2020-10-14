const { MessageEmbed } = require("discord.js"); // Requiring this since we need it for embeds later

let authors = [];
let warned = [];
let punishedList = [];
let messageLog = [];

module.exports = async (client, options) => {
  /* Declaring our options which we are going to work on */
  
  const limitUntilWarn = (options && options.limitUntilWarn) || 3; // Default value: 3. Explanation: This is the limit where you get the warn message. If the member X sent over 3 messages within the interval, he get warned
  const limitUntilMuted = (options && options.limitUntilMuted) || 5; // Default value: 5. Explanation: This is the limit where you get Punished. If the member X sent over 5 messages within the interval, he get muted.
  const interval = (options && options.interval) || 2000; //Default Time: 2000MS (1000 milliseconds = 1 second, 2000 milliseconds = 2 seconds etc...). Explanation: The interval where the messages are sent. Practically if member X sent 5+ messages within 2 seconds, he get muted
  const warningMessage = (options && options.warningMessage) || "If you don't stop spamming, I'm going to mute you!"; // Default Message: If you don't stop spamming, I'm going to mute you!. Explanation: None, it's just a message you get for the warning phase.
  const muteMessage = (options && options.muteMessage) || "was muted due to spam."; // Default Message: "was muted due to spam.". Explanation: The message sent after member X was punished
  const maxDuplicatesWarning = (options && options.maxDuplicatesWarning || 7); // Default value: 7. Explanation: When people are spamming the same message, <limitUntilWarn> is ignored and this will trigger when member X sent over 7+ message that are the same.
  const maxDuplicatesMute = (options && options. maxDuplicatesMute || 10); // Deafult value: 10 Explanation: The limit where member X get muted after sending too many messages(10+).
  const ignoredRoles = (options && options.ignoredRoles) || []; // Default value: None. Explanation: The members with this role(or roles) will be ignored if they have it. Suggest to not add this to any random guys.
  const ignoredMembers = (options && options.ignoredMembers) || []; // Default value: None. Explanation: These members are directly affected and they do not require to have the role above. Good for undercover pranks.
  const mutedRole = (options && options.mutedRole) || "muted"; // Default value: muted. Explanation: Here you put the name of the role that should not let people write/speak or anything else in your server. If there is no role set, by default, the module will attempt to create the role for you & set it correctly for every channel in your server. It will be named "muted".
  const timeMuted = (options && options.timeMuted) || 1000 * 600; // Default value: 10 minutes. Explanation: This is how much time member X will be muted. if not set, default would be 10 min.
  const logChannel = (options && options.logChannel) || "AntiSpam-logs"; // Default value: "AhtiSpam-logs". Explanation: This is the channel where every report about spamming goes to. If it's not set up, it will attempt to create the channel.

// If something is added wrong, throw an error

  if(isNaN(limitUntilWarn)) throw new Error("ERROR: The <limitUntilWarn> option is not set up right! Please check it again to ensure it's a number in the settings.");
  if(isNaN(limitUntilMuted)) throw new Error("ERROR: The <limitUntilMuted> option is not set up right! Please add a number in the settings.");
  if(isNaN(interval)) throw new Error("ERROR: The <interval> option is not set up right! Please add a number in the settings.");
  if(!isNaN(warningMessage) || warningMessage.length < 5) throw new Error("ERROR: The <warningMessage> option must be a string and at least 5 characters long (including space).");
  if(!isNaN(muteMessage) || muteMessage.length < 5) throw new Error("ERROR: The <muteMessage> option must be a string and at least 5 characters long (including space).");
  if(isNaN(maxDuplicatesWarning)) throw new Error("ERROR: The <maxDuplicatesWarning> option is not set up right! Please check it again to ensure it's a number in the settings.")
  if(isNaN(maxDuplicatesMute)) throw new Error("ERROR: The <maxDuplicatesMute> option is not set up right! Please check it again to ensure it's a number in the settings.");
  if(isNaN(timeMuted)) throw new Error("ERROR: The <timeMuted> option is not set up right! Please check it again to ensure it's a number in the settings.");
  if(ignoredRoles.constructor !== Array) throw new Error("ERROR: The <ignoredRoles> option is not set up right! Please check it again to ensure it's an array in the settings.");
  if(ignoredMembers.constructor !== Array) throw new Error("ERROR: The <ignoredMembers> option is not set up right! Please check it again to ensure it's an array in the settings.");
  
  // Custom 'checkMessage' event that handles messages
 client.on("checkMessage", async (message) => {
 
  //time variables
  let clock = new Date();
  let ss = String(clock.getSeconds()).padStart(2, '0');
  let min = String(clock.getMinutes()).padStart(2, '0');
  let hrs = String(clock.getHours()).padStart(1, '0');
  clock = hrs + ':' + min +':' + ss;

  let TheDate = new Date()
  let zilelesaptamanii = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let weekday = zilelesaptamanii[TheDate.getDay()];
  let dd = String(TheDate.getDate()).padStart(2, '0');
  let mon = String(TheDate.getMonth()+ 1);
  let year = String(TheDate.getFullYear()).padStart(4,'00');
  TheDate = weekday+", " + mon + '/' + dd +'/' + year;
  //end of time variables

  //verify if it's pm or AM
  let amORpm;
  if(hrs >= 0 && hrs <= 12){
      amORpm = "AM"
  }else{
      amORpm = "PM"
  };
  // The Mute function.
  const MuteMember = async (m, muteMsg) => {
    for (var i = 0; i < messageLog.length; i++) {
        if (messageLog[i].author == m.author.id) {
          messageLog.splice(i);
        }
      }
  
      punishedList.push(m.author.id);
      
      let user = m.guild.members.cache.get(m.author.id);
      let ReportChannel = m.guild.channels.cache.find(ch => ch.name === logChannel);
      if(!ReportChannel){
        try{
            ReportChannel = await m.guild.channels.create('antispam-logs', {
              type: 'text',
              permissionOverwrites:[{
                id: m.guild.id,
                deny: ['VIEW_CHANNEL']
              }]
            })
              .then(m=> m.send(`Created a **\`anti-spam-Logs\`** channel since a channel for reports wasn't provided from the beginning when setting up the module.`))
              .catch(console.error)
  
        }catch(e){
          console.log(e.stack);
        }
      }; // end of creating the channel for anti spam logs

      let role = m.guild.roles.cache.find(namae => namae.name === mutedRole);      
      if (!role) {
        try {
            role = await m.guild.roles.create({
              data:{
                name: "muted",
                color: "#000000",
                permissions: []
              },
              reason: `muted role wasn't found! Created a new one!`
            })
            m.guild.channels.cache.forEach(async (thechann, id) => {
                await thechann.updateOverwrite(role, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false,
                    SEND_TTS_MESSAGES: false,
                    ATTACH_FILES: false,
                    SPEAK: false
                });
            });
           ReportChannel.send(`Created a **\`muted\`** role since a role wasn't provided from the beginning when setting up the module.`) 
        } catch (e) {
            console.log(e.stack);
        }
    }//end of creating the role
    
      if (user) {
        user.roles.add(role).then(()=>{
          m.channel.send(`<@!${m.author.id}>, ${muteMsg}`);
          let muteEmbed = new MessageEmbed()
            .setAuthor(' Action | Auto Mute', `https://images-ext-2.discordapp.net/external/Wms63jAyNOxNHtfUpS1EpRAQer2UT0nOsFaWlnDdR3M/https/image.flaticon.com/icons/png/128/148/148757.png`)
            .addField('Member muted:',`${user}`)
            .addField(`Muted for:`,`${timeMuted} seconds (10 min)`)
            .addField('Muted because: ', `Spam`)
            .addField(`Muted At:`,TheDate+ " at "+ clock+" "+amORpm)
            .setColor('#D9D900')
          ReportChannel.send(muteEmbed);
          setTimeout(()=>{
            user.roles.remove(role);
            let unmutedEmbed = new MessageEmbed()
              .setAuthor('Action | Auto Unmute')
              .addField(`Member unmuted:`,`${user}`)
              .addField(`Reason of unmute:`,`Time Expired(10 min)`)
              .setColor('#D9D900')
          ReportChannel.send(unmutedEmbed)
          }, timeMuted);
          return true;
       }).catch((e) => {
          m.guild.owner.send(`Oops, seems like I don't have sufficient permissions to mute <@!${message.author.id}>!\n It can be that or another type of error happened! Tell me on github: https://github.com/Damien111/better-discord-antispam \n Everything happened on ${TheDate} at ${clock} ${amORpm} with message:\n\n\`${e.message}\`\n\n *P.S: If this is the first time getting something like this, most likely it was because the log channel was not set up at the beginning and didn't know where to send the reports. Do not panic, next time it will work since we created the channel where to send the reports!*`);
          return false;
      });
    }//end of user
  }
  
    
   // The warning function.
   const WarnMember = async (m, reply) => {
    warned.push(m.author.id);
    m.channel.send(`<@${m.author.id}>, ${reply}`);
   }

    if (message.author.bot) return;
    if (message.channel.type !== "text" || !message.member || !message.guild || !message.channel.guild) return;
   
    if (message.member.roles.cache.some(r => ignoredRoles.includes(r.name)) || ignoredMembers.includes(message.author.tag)) return;

    if (message.author.id !== client.user.id) {
      let currentTime = Math.floor(Date.now());
      authors.push({
        "time": currentTime,
        "author": message.author.id
      });
      
      messageLog.push({
        "message": message.content,
        "author": message.author.id
      });
      
      let msgMatch = 0;
      for (var i = 0; i < messageLog.length; i++) {
        if (messageLog[i].message == message.content && (messageLog[i].author == message.author.id) && (message.author.id !== client.user.id)) {
          msgMatch++;
        }
      }
      
      if (msgMatch == maxDuplicatesWarning && !warned.includes(message.author.id)) {
        WarnMember(message, warningMessage);
      }

      if (msgMatch == maxDuplicatesMute && !punishedList.includes(message.author.id)) {
        MuteMember(message, muteMessage);
      }

      var matched = 0;

      for (var i = 0; i < authors.length; i++) {
        if (authors[i].time > currentTime - interval) {
          matched++;
          if (matched == limitUntilWarn && !warned.includes(message.author.id)) {
            WarnMember(message, warningMessage);
          } else if (matched == limitUntilMuted) {
            if (!punishedList.includes(message.author.id)) {
              MuteMember(message, muteMessage);
            }
          }
        } else if (authors[i].time < currentTime - interval) {
          authors.splice(i);
          warned.splice(warned.indexOf(authors[i]));
          punishedList.splice(warned.indexOf(authors[i]));
        }

        if (messageLog.length >= 200) {
          messageLog.shift();
        }
      }
    }
  });
}
