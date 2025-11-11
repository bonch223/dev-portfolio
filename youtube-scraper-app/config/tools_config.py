"""Tool-specific search terms and configuration."""

AUTOMATION_TOOLS = {
    'zapier': {
        'name': 'Zapier',
        'color': '#FF4A00',
        'icon': '⚡',
        'search_terms': {
            'beginner_basics': [
                'zapier tutorial', 'zapier beginner', 'zapier getting started',
                'zapier basics', 'zapier for beginners', 'zapier introduction',
                'zapier first zap', 'zapier setup tutorial', 'zapier quick start',
                'zapier walkthrough', 'zapier demo', 'zapier explained',
                'zapier overview', 'zapier fundamentals', 'zapier crash course',
                'what is zapier', 'how to use zapier', 'zapier 101',
                'zapier step by step', 'zapier guide'
            ],
            'beginner_features': [
                'zapier trigger tutorial', 'zapier action tutorial',
                'zapier app integration', 'zapier templates', 'zapier formatter',
                'zapier delay', 'zapier schedule', 'zapier zap basics',
                'zapier multi-step', 'zapier task history', 'zapier testing zaps',
                'zapier connections', 'zapier accounts', 'zapier free plan'
            ],
            'intermediate_integrations': [
                'zapier google sheets', 'zapier gmail automation',
                'zapier slack integration', 'zapier google calendar',
                'zapier trello automation', 'zapier asana integration',
                'zapier salesforce', 'zapier hubspot', 'zapier mailchimp',
                'zapier airtable', 'zapier notion integration', 'zapier monday.com',
                'zapier clickup', 'zapier pipedrive', 'zapier stripe integration',
                'zapier paypal', 'zapier shopify automation', 'zapier woocommerce',
                'zapier wordpress', 'zapier typeform', 'zapier jotform',
                'zapier calendly', 'zapier zoom automation', 'zapier discord',
                'zapier telegram bot'
            ],
            'intermediate_workflows': [
                'zapier workflow automation', 'zapier business automation',
                'zapier productivity', 'zapier lead generation',
                'zapier email automation', 'zapier crm automation',
                'zapier data sync', 'zapier form automation',
                'zapier invoice automation', 'zapier document automation',
                'zapier task automation', 'zapier notification automation',
                'zapier reporting automation', 'zapier social media automation',
                'zapier content automation', 'zapier marketing automation',
                'zapier sales automation', 'zapier customer service automation'
            ],
            'advanced_technical': [
                'zapier webhook', 'zapier API', 'zapier custom integration',
                'zapier code step', 'zapier python', 'zapier javascript',
                'zapier paths', 'zapier filter', 'zapier lookup table',
                'zapier storage', 'zapier sub-zap', 'zapier digest',
                'zapier error handling', 'zapier debugging', 'zapier app builder',
                'zapier cli', 'zapier platform', 'zapier developer',
                'zapier rest api', 'zapier graphql'
            ],
            'advanced_use_cases': [
                'zapier complex workflow', 'zapier advanced automation',
                'zapier enterprise', 'zapier multi-app workflow',
                'zapier conditional logic', 'zapier data transformation',
                'zapier batch processing', 'zapier bulk operations',
                'zapier custom functions', 'zapier advanced filtering',
                'zapier regex', 'zapier data mapping'
            ],
            'expert_specialized': [
                'zapier ai integration', 'zapier chatgpt automation',
                'zapier openai', 'zapier machine learning'
            ],
            'industry_specific': [
                'zapier real estate', 'zapier ecommerce', 'zapier agency',
                'zapier freelancer', 'zapier saas', 'zapier startup',
                'zapier accounting', 'zapier education', 'zapier consulting'
            ]
        }
    },
    'n8n': {
        'name': 'N8N',
        'color': '#EA4B71',
        'icon': '🔄',
        'search_terms': {
            'beginner_basics': [
                'n8n tutorial', 'n8n beginner', 'n8n getting started',
                'n8n basics', 'n8n for beginners', 'n8n introduction',
                'n8n first workflow', 'n8n setup tutorial', 'n8n quick start',
                'n8n walkthrough', 'n8n demo', 'n8n explained',
                'n8n overview', 'n8n fundamentals', 'n8n crash course',
                'what is n8n', 'how to use n8n', 'n8n 101',
                'n8n step by step', 'n8n guide'
            ],
            'beginner_setup': [
                'n8n installation', 'n8n docker setup', 'n8n cloud tutorial',
                'n8n self hosted', 'n8n local setup', 'n8n vps setup',
                'n8n railway deployment', 'n8n digital ocean',
                'n8n aws deployment', 'n8n server setup', 'n8n configuration'
            ],
            'beginner_concepts': [
                'n8n node tutorial', 'n8n workflow tutorial', 'n8n trigger node',
                'n8n credentials', 'n8n connections', 'n8n expressions',
                'n8n data structure', 'n8n testing workflows', 'n8n executions',
                'n8n variables', 'n8n parameters', 'n8n workflow examples'
            ],
            'intermediate_nodes': [
                'n8n http request', 'n8n webhook', 'n8n function node',
                'n8n code node', 'n8n if node', 'n8n switch node',
                'n8n merge node', 'n8n split node', 'n8n set node',
                'n8n edit fields', 'n8n item lists', 'n8n aggregate',
                'n8n sort node', 'n8n cron node', 'n8n schedule trigger',
                'n8n wait node', 'n8n execute workflow', 'n8n loop node'
            ],
            'intermediate_integrations': [
                'n8n google sheets', 'n8n gmail automation', 'n8n slack integration',
                'n8n discord bot', 'n8n telegram bot', 'n8n notion integration',
                'n8n airtable', 'n8n postgres', 'n8n mysql', 'n8n mongodb',
                'n8n supabase', 'n8n stripe integration', 'n8n shopify',
                'n8n wordpress', 'n8n typeform', 'n8n calendly',
                'n8n zoom automation', 'n8n github integration', 'n8n jira automation'
            ],
            'advanced_ai': [
                'n8n ai automation', 'n8n chatgpt integration', 'n8n openai',
                'n8n gpt4', 'n8n langchain', 'n8n ai agent', 'n8n chatbot',
                'n8n voice assistant', 'n8n text generation', 'n8n dall-e',
                'n8n vector database', 'n8n pinecone', 'n8n rag system'
            ],
            'advanced_workflows': [
                'n8n advanced workflow', 'n8n complex automation',
                'n8n error workflow', 'n8n error handling', 'n8n retry logic',
                'n8n conditional routing', 'n8n data transformation',
                'n8n batch processing', 'n8n parallel execution',
                'n8n rate limiting', 'n8n pagination', 'n8n etl pipeline',
                'n8n data pipeline', 'n8n microservices'
            ],
            'expert_development': [
                'n8n custom node', 'n8n node development',
                'n8n community nodes', 'n8n javascript code',
                'n8n typescript', 'n8n custom credential', 'n8n oauth2'
            ],
            'use_cases': [
                'n8n scraping', 'n8n web scraping', 'n8n data extraction',
                'n8n automation examples', 'n8n business automation',
                'n8n agency automation', 'n8n crm automation',
                'n8n lead generation', 'n8n email marketing',
                'n8n social media automation', 'n8n content creation'
            ]
        }
    }
}

def get_all_search_terms(tool_name):
    """Get all search terms for a specific tool."""
    tool = AUTOMATION_TOOLS.get(tool_name.lower())
    if not tool:
        return []
    
    all_terms = []
    for category, terms in tool['search_terms'].items():
        all_terms.extend(terms)
    return all_terms

def get_search_terms_by_category(tool_name, categories=None):
    """Get search terms for specific categories."""
    tool = AUTOMATION_TOOLS.get(tool_name.lower())
    if not tool:
        return []
    
    if categories is None:
        categories = tool['search_terms'].keys()
    
    terms = []
    for category in categories:
        if category in tool['search_terms']:
            terms.extend(tool['search_terms'][category])
    return terms




