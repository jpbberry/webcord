/**
 * @callback dataCallback
 * @param {string} data Sends data back
 */


/**
 * @callback handler
 * @param {function} cb Sends a somewhat descriptive message back to handle.
 */

/**
 * @typedef {string} ID A string that identifies, guilds, users, roles, and channels. Typically 15-20 characters long
 */ /**
 * @typedef {string} Discriminator 4 number string that identifies along side the username. Ranges from 0001-9999
 */ /**
 * @typedef {string} tag The username and discriminator added together like Username#DISCRIM (Ex: JPBBerry#0001)
 */ /**
 * @typedef {string} Region Region of Guild that voice is hosted from. 'japan', 'singapore', 'eu-central', 'us-central', 'london', 'eu-west', 'amsterdam', 'brazil', 'us-west', 'hongkong', 'us-south', 'southafrica', 'us-east', 'sydney', 'frankfurt', 'russia'
 */

class Client {
    /**
     * @class Client
     * @prop {handler} handle Error handling function
     * @prop {string} token Token of logged in account
     * @prop {string} req.accountType Account type
     * @prop {string} req.api API Endpoint
     * @prop {object} req.extraHeaders Extra headers to append to every request
     *
     * Used to make an instance of client.
     * 
     * @param {string} token Token for the client.
     * @param {handler} handler
     * @param {object} opts
     * @param {string} opts.endpoint [OPTIONAL] Use to set a seperate Discord API endpoint.
     * @param {object} opts.extraHeaders [OPTIONAL] Add extra headers to your requests.
     * @param {string} opts.accountType [OPTIONAL] Used to set a custom Authorization: TYPE Token.
     */
    constructor(token, handler=console.log, opts = {}) {
        this.handle = function(msg,extraInfo) {
            handler(msg);
            if(extraInfo) console.error(extraInfo);
            return null;
        };
        if(!token) return this.handle("You need a token!");
        this.token = token;
        this.req = {
            api: opts.endpoint || "https://discordapp.com/api", //;
            extraHeaders: opts.extraHeaders || null, // {header1: value1, header2: value2};
            accountType: opts.type || "Bot" //dont self bot kids, it's not safe.;
        };
        return this;
    };
    /**
     * Make authenticated requests to Discord REST
     * 
     * @param {string} endpoint Link that follows <endpoint>/api
     * @param {string} method GET/POST/PATCH/DELETE/PUT/HEAD/CONNECT/OPTIONS/TRACE
     * @param {dataCallback} callback 
     */
    authRequest(endpoint, method, callback, body) {
        var xmlHttp;			
		if(window.XMLHttpRequest) {
			xmlHttp = new XMLHttpRequest();
		}else{
			xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
		
		if(xmlHttp) {
			if(xmlHttp) {
			    try{
                    xmlHttp.open(method.toUpperCase(), this.req.api + endpoint, true);
                    xmlHttp.setRequestHeader("Content-Type", "application/json");
                    if(this.req.extraHeaders instanceof Object) Object.keys(this.req.extraHeaders).forEach(function(header) {
                        xmlHttp.setRequestHeader(header, this.req.extraHeaders[header]);
                    });
                    xmlHttp.setRequestHeader("Authorization", this.req.accountType + " " + this.token);
			    	xmlHttp.onreadystatechange = handleServerResponse;
			    	xmlHttp.send(body ? JSON.stringify(body) : null);
			    }catch(e) {
                    this.handle("Internet connection isn't connecting the internet",e);
			    }
		    }
        }
        var handle = this.handle
        function handleServerResponse() {
            if(xmlHttp.readyState == 4) {
                if(xmlHttp.status == 200) {
                    var response;
                    try{;
                        response = JSON.parse(xmlHttp.response);
                    }catch(e) {;
                        handle("Invalid response from server.");
                    };
                    if(!response) return;
                    callback(response);
                } else {;
                    handle("Failed to make request! (Status: " + xmlHttp.status + ")",xmlHttp.readyState);
                };
            };
        };
    };
    //Retrieve

    /**
     * Get logged in user
     * @type {Promise}
     */
    getMe() {
        var client = this;
        return new Promise(function(resolve) {
            client.authRequest("/users/@me", "GET", resolve);
        });
    };
    /**
     * Retrieves other user
     * @param {ID} userID ID of user to retrieve
     */
    getUser(userID) {
        var client = this;
        return new Promise(function(resolve) {
            client.authRequest("/users/" + userID, "GET", function(userData) {
                resolve(new User(userData, client));
            });
        });
    };
    /**
     * Retrieves all guild info
     * @param {ID} guildID ID of guild to retrieve
     */
    getGuild(guildID) {
        var client = this;
        return new Promise(function(resolve) {
            client.authRequest("/guilds/" + guildID, "GET", function(data) {
                resolve(new Guild(data, client));
            });
        });
    };
    /**
     * Retrieves guild member from user and guild
     * @param {ID} guildID ID of guild member is in.
     * @param {ID} userID ID of user to retrieve member of
     */
    getGuildMember(guildID, userID) {
        var client = this;
        return new Promise(function(resolve) {  
            client.authRequest("/guilds/"+guildID+"/"+userID,"GET",function(data){
                data.guildID = guildID;
                resolve(new GuildMember(data, client));
            });
        });
    };
    /**
     * Retrieve list of channels in specific guild
     * @param {ID} guildID ID of guild to retrieve
     */
    getGuildChannels(guildID) {
        var client = this;
        return new Promise(function(resolve) {
            client.authRequest("/guilds/"+guildID+"/channels","GET",function(data) {
                var Channels = {};
                data.forEach(function(channel) {
                    Channels[channel.id] = new Channel(channel, client);
                })
                resolve(Channels);
            });
        });
    };
    /**
     * Retrieve full channel info
     * @param {ID} channelID ID of channel
     */
    getChannel(channelID) {
        var client = this;
        return new Promise(function(resolve) {
            client.authRequest("/channels/"+channelID,"GET",function(data) {
                resolve(new Channel(data, client));
            });
        });
    };
    /**
     * List of roles in a specific guild
     * @param {ID} guildID ID of guild
     */
    getGuildRoles(guildID) {
        var client = this;
        return new Promise(function(resolve) {
            client.authRequest("/guilds/"+guildID+"/roles","GET",resolve);
        });
    };
    /**
     * Gets one specific role from guild role list.
     * @param {ID} guildID ID of guild
     * @param {ID} roleID ID of role
     */
    getGuildRole(guildID,roleID) {
        var client = this;
        return new Promise(function(resolve) {
            client.getGuildRoles(guildID, function(data) {
                resolve(data[data.map(x=>x.id).indexOf(roleID)]);
            });
        });
    };
    getChannelPins(channelID) {
        var client = this;
        return new Promise(function(resolve) {
            channel.client.authRequest("/channels/"+channelID+"/pins","GET",resolve);
        });
    };

    //Open

    /**
     * Open's a DM channel with specific user
     * @param {ID} userID ID of user to open DM with
     */
    openDMChannel(userID) {
        var client = this;
        return new Promise(function(resolve) {
            client.authRequest("/users/@me/channels","POST",resolve, {
                recipient_id: userID
            });
        });
    };

    //Send

    /**
     * Send's a message to a specific channel
     * @param {ID} channelID ID of channel to send message too
     * @param {string} content Content of message to send
     */
    sendMessage(channelID, content) {
        if(!content) return this.client.handle("Cannot send empty message at <Client>.sendMessage");
        var client = this;
        return new Promise(function(resolve) {
            client.authRequest("/channels/"+channelID+"/messages","POST",resolve,{
                content: content
            });
        });
    };

    //Set

    /**
     * Change's specific value of channel
     * @param {ID} channelID ID of channel to edit
     * @param {string} KEY Property to change
     * @param {*} VALUE New value of property
     */
    setChannelProperty(channelID, KEY, VALUE) {
        var client = this;
        return new Promise(function(resolve) {
            var body = {};
            body[KEY] = VALUE;
            client.authRequest("/channels/"+channelID,"PATCH",resolve,body);
        });
    };

    /**
     * Change's specific value of guild
     * @param {ID} channelID ID of guild to edit
     * @param {string} KEY Property to change
     * @param {*} VALUE New value of property
     */
    setGuildProperty(channelID, KEY, VALUE) {
        var client = this;
        return new Promise(function(resolve) {
            var body = {};
            body[KEY] = VALUE;
            client.authRequest("/guilds/"+channelID,"PATCH",resolve,body);
        });
    };

    /**
     * Log's out of the client user.
     */
    logout() {
        this.token = null;
        return true;
    }
};

class User {
    /**
     * @class User
     * @prop {object} raw Raw data recieved from client
     * @prop {Client} client Client that initiated the user
     * @prop {string} username Username of user
     * @prop {Discriminator} discriminator Discriminator of user (No #)
     * @prop {ID} id ID of user
     * @prop {string} avatar Avatar dataB string
     * @prop {link} avatarURL Link of full avatar image
     * @prop {tag} tag Full username + discriminator (Username#Discrim)
     * 
     * @param {object} data Served from Client
     * @param {Client} client Client that initiated the user
     */
    constructor(data={}, client) {
        this.raw = data || null;
        this.client = client || null;
        this.username = data.username || null;
        this.discriminator = data.discriminator || null;
        this.id = data.id || null;
        this.avatar = data.avatar || null;
        this.avatarURL = "https://cdn.discordapp.com/avatars/"+(data.id || null)+"/"+data.avatar || "https://discordapp.com/assets/322c936a8c8be1b803cd94861bdfa868.png";
        this.tag = (data.username || null) + "#" + (data.discriminator || null);
    };

    /**
     * Send a message to the user
     * @param {string} messageContent Content of message
     * @param {object} extra Extra data
     */
    sendMessage(messageContent, extra) {
        if(!content) return this.client.handle("Cannot send empty message at <User>.sendMessage");
        var user = this;
        var client = this.client;
        return new Promise(function(resolve) {
            client.openDMChannel(this.id,function(response) {
                client.sendMessage(response.id, messageContent, function(data) {
                    data.recipient = user;
                    resolve(data);
                });
            });
        });
    };
};

class Guild {
    /**
     * @class Guild
     * @prop {object} raw Raw data recieved from client
     * @prop {Client} client Client that initiated the guild
     * @prop {ID} id ID of the guild
     * @prop {string} name Guild's name
     * @prop {ID} ownerID ID of the owner of the guild
     * @prop {string} region Region of the guild
     * @prop {array} roles List of all the roles
     * 
     * @param {object} data Served from Client
     * @param {Client} client Client that initated the guild
     */
    constructor(data={}, client) {
        this.setValues(data, client);
    };
    
    setValues(data={}, client) {
        this.raw = data || null;
        this.client = client || null;
        this.id = data.id || null;
        this.name = data.name || null;
        this.ownerID = data.owner_id || null;
        this.region = data.region || null;
        this.roles = data.roles || null;
        this.icon = data.icon || null;
        this.iconURL = "https://cdn.discordapp.com/icons/" + (data.id || null) + "/" + (data.icon || null);
    };
    /**
     * Retrieve all of the channels in a guild
     */
    getChannels() {
        var guild = this;
        return new Promise(function(resolve) {
            guild.client.getGuildChannels(guild.id).then(resolve);
        });
    };
    
    /**
     * Retrieve all of the roles in a guild
     */
    getRoles() {
        var guild = this;
        return new Promise(function(resolve) {
            guild.client.getGuildRoles(guild.id).then(resolve);
        });
    };

    /**
     * Resolve member from this guild
     * @param {ID} memberID ID of user to resolve member of
     */
    getMember(memberID) {
        var guild = this;
        return new Promise(function(resolve) {
            guild.client.getGuildMember(guild.id, memberID).then(resolve);
        });
    };

    /**
     * Resolve member object of this guild
     */
    resolveOwner() {
        var guild = this;
        return new Promise(function(resolve) {
            guild.client.getGuildMember(guild.id,guild.ownerID).then(resolve);
        });
    };

    /**
     * Set the name of the guild
     * @param {string} newName New name for guild
     */
    setName(newName) {
        var guild = this;
        return new Promise(function(resolve) {
            guild.client.setGuildProperty(guild.id, "name", newName).then(function(result) {
                guild.setValues(result);
                resolve(guild);
            });
        });
    };

    /**
     * Set's the explicit content filter level
     * @param {integer} level New level of filter (0/1/2)
     */
    setContentFilter(level) {
        if(![0,1,2].includes(level)) return this.client.handle("Incorrect paramater at <Guild>.setContentFilter");
        var guild = this;
        return new Promise(function(resolve) {
            guild.client.setGuildProperty(guild.id, "explicit_content_filter", new Number(level));
        });
    };

    /**
     * Set's the voice host region for the guild
     * @param {Region} newRegion New region for the guild
     */
    setRegion(newRegion) {
        var regions = ['japan', 'singapore', 'eu-central', 'us-central', 'london', 'eu-west', 'amsterdam', 'brazil', 'us-west', 'hongkong', 'us-south', 'southafrica', 'us-east', 'sydney', 'frankfurt', 'russia'];
        if(!regions.includes(newRegion)) return this.client.handle("Incorrect paramater at <Guild>.setRegion");
        var guild = this;
        return new Promise(function(resolve) {
            guild.client.setGuildProperty(guild.id, "region", newRegion).then(function(result) {
                guild.setValues(result);
                resolve(guild);
            });
        });
    };
};

class GuildMember {
    /**
     * @class GuildMember
     * @prop {object} raw Raw data received from client
     * @prop {Client} client Client that initiated the guild member
     * @prop {User} user User object of the guild member
     * @prop {ID} guildID ID of the guild the member belongs too
     * @prop {object} serverProp Small data member to server
     * @prop {boolean} serverProp.mute Whether the member is server muted
     * @prop {boolean} serverProp.deaf Whether the member is server deafened
     * @prop {Date} joinedAt The date in which the member joined the guild
     * 
     * @param {object} data Served from Client
     * @param {Client} client Client that initated the guild member
     */ 
    constructor(data={}, client) {
        this.raw = data || null;
        this.client = client || null;
        this.nickname = data.nick || null;
        this.roles = data.roles || null;
        this.guildID = data.guildID || null;
        this.serverProp = {
            mute: data.mute || null,
            deaf: data.deaf || null
        };
        this.joinedAt = data.joined_at ? new Date(data.joined_at) : null;
        this.user = new User(data.user,client);
    }

    resolveGuild() {
        var guildmember = this;
        return new Promise(function(resolve) {
            guildmember.client.getGuild(guildmember.guildID).then(resolve);
        });
    };
};
class Channel {
    /**
     * @class Channel
     * @prop {object} raw Raw data received from client
     * @prop {Client} client Client that initiated the channel
     * @prop {ID} id ID of the channel
     * @prop {string} name Name of the channel
     * @prop {array} permissions Permission overwrites
     * @prop {ID} guildID ID of the guild the channel belongs
     * @prop {string} type All 6 different types
     * @prop {string} topic Topic for the channel (if text channel)
     * @prop {boolean} nsfw Whether the channel is marked as NSFW
     * @prop {ID} parentID ID of the channel that parents this one (if any)
     * @prop {ID} lastMessageID ID of the latest message in the channel (if text channel)
     * @prop {Date} lastPinTime The time of latest pinned message (if text channel)
     * @prop {object} typeToName Used to move Number received from endpoint to channel type
     * 
     * @param {object} data 
     * @param {Client} client 
     */
    constructor(data={}, client) {
        this.setValues(data,client);
    }

    setValues(data={}, client) {
        this.raw = data || null;
        this.client = client || null;
        this.id = data.id || null;
        this.name = data.name || null;
        this.permissions = data.permission_overwrites || null;
        this.position = data.position || null;
        this.guildID = data.guild_id || null;
        this.typeToName = {
            0: "text",
            1: "dm",
            2: "voice",
            3: "group",
            4: "category",
            5: "news",
            6: "store"
        }
        this.type = this.typeToName[data.type] || null;
        this.topic = data.topic || null;
        this.nsfw = data.nsfw || null;
        this.parentID = data.parent_id || null;
        this.lastMessageID = data.last_message_id || null;
        this.lastPinTime = data.last_pin_timestamp ? new Date(data.last_pin_timestamp) : null;
    }

    /**
     * Send a message to this channel
     * @param {string} content Content of the message
     */
    sendMessage(content) {
        if(!content) return this.client.handle("Cannot send empty message at <Channel>.sendMessage");
        var channel = this;
        return new Promise(function(resolve) {
            channel.client.sendMessage(channel.id,content).then(resolve);
        });
    };

    /**
     * Get list of pinned messages
     */
    getPinnedMessage() {
        var channel = this;
        return new Promise(function(resolve) {
            channel.client.getChannelPins(channel.id).then(function(data) {
                data.channel = channel;
                resolve(data);
            })
        });
    };

    /**
     * Set NSFW on the channel
     * @param {boolean} TOGGLE What value to set NSFW to.
     */
    setNSFW(TOGGLE) {
        if(typeof TOGGLE != "boolean") return this.client.handle("Missing/Invalid value for nsfw at <Channel>.setNSFW");
        var channel = this;
        return new Promise(function(resolve) {
            channel.client.setChannelProperty(channel.id, "nsfw", TOGGLE).then(function(result) {
                channel.setValues(result);
                resolve(channel);
            });
        });
    };

    /**
     * Set the name of the channel
     * @param {string} newName 
     */
    setName(newName) {
        var channel = this;
        return new Promise(function(resolve) {
            channel.client.setChannelProperty(channel.id, "name", newName).then(function(result) {
                channel.setValues(result);
                resolve(channel);
            });
        });
    };

    /**
     * Set the topic of the channel
     * @param {string} newTopic 
     */
    setTopic(newTopic) {
        var channel = this;
        return new Promise(function(resolve) {
            channel.client.setChannelProperty(channel.id,"topic",newTopic).then(function(result) {
                channel.setValues(result);
                resolve(channel);
            });
        });
    };

    /**
     * Resolve's the guild the channel belongs to
     */
    resolveGuild() {
        var channel = this;
        return new Promise(function(resolve) {
            channel.client.getGuild(channel.guildID).then(resolve);
        });
    };
}

var Discord = {
    Client: Client
}