export const calloutText = {
  moderation: {
    deprecationText: 'This API has been deprecated, use the updated version at - ',
    url: {
      createRule: {
        url: '/rest-api/moderation/add-rule',
        text: 'Create Rule'
      },
      listRules: {
        url: '/rest-api/moderation/list-rules',
        text: 'List Rules'
      },
      getRule: {
        url: '/rest-api/moderation/get-rule',
        text: 'List Rule'
      },
      updateRule: {
        url: '/rest-api/moderation/update-rule',
        text: 'Update Rule'
      },
      removeRule: {
        url: '/rest-api/moderation/remove-rule',
        text: 'Remove Rule'
      },
      listRuleKeywords: {
        url: '/rest-api/moderation/list-keywords',
        text: 'List Keywords'
      },
      addKeyWords: {
        url: '/rest-api/moderation/add-keywords',
        text: 'Add Keywords'
      },
      getKeyword: {
        url: '/rest-api/moderation/get-keyword',
        text: 'Get Keyword'
      },
      updateKeyword: {
        url: '/rest-api/moderation/update-keyword',
        text: 'Update Keyword'
      },
      removeKeyword: {
        url: '/rest-api/moderation/remove-keyword',
        text: 'Remove Keyword'
      },
      getRuleRevisions: {
        url: '/rest-api/moderation/get-rule-revisions',
        text: 'Get Rule Revisions'
      },
      listBlockedMessages: {
        url: '/rest-api/moderation/list-blocked-messages',
        text: 'List Blocked Messages'
      },
      approveBlockedMessages: {
        url: '/rest-api/moderation/approve-blocked-messages',
        text: 'Approve Blocked Messages'
      }
    }
  }
};


export const Callout = ({ text, urlKey }) => {
  return (
    <div>
      <Note>{text}<a href={urlKey['url']} target='blank'>{urlKey['text']}</a></Note>
    </div>
  )
}
