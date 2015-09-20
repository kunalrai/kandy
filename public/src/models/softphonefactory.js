function AgentFactory() {}


AgentFactory.prototype.agentClass = kandyAgent;

AgentFactory.prototype.createAgent = function ( options ) {

    switch(options.agentType){
        case "kandyAgent":
            this.agentClass = kandyAgent;
            break;
        case "ChatProxy":
            this.agentClass = ChatProxy;
            break;
    }
    return new this.agentClass();

};