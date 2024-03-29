describe('Welcome Page', () => {
  let srcConfig: any

  before(() => {
    cy.fixture('source').then(sourceCredentials => {
      srcConfig = sourceCredentials
    })
  })

  beforeEach(() => {
    cy.toInitialState()
    cy.OAuthLogout()
  })

  it('set up InfluxDB connection', () => {
    cy.get('button').contains('Get Started').click()
    cy.getByTestID('connection-url--input')
      .clear()
      .type(srcConfig.influxDBURL)
    cy.getByTestID('connection-name--input')
      .clear()
      .type(srcConfig.connectionName)
    cy.getByTestID('connection-username--input')
      .clear()
      .type(srcConfig.username)
    cy.getByTestID('connection-password--input')
      .clear()
      .type(srcConfig.password)
    cy.getByTestID('unsafe-ssl--checkbox').click()

    cy.getByTestID('meta-service-connection-url--input')
      .clear()
      .type(srcConfig.metaUrl)
      .then(() => {})

    cy.get('.wizard-button-bar').within(() => {
      cy.get('button').contains('Add Connection').click()
    })

    cy.getByTestID('skip-button').click()
    cy.getByTestID('skip-button').click()
    cy.get('button').contains('View All Connections').click()

    cy.request('GET', '/chronograf/v1/sources').then(response => {
      const connections = response.body.sources

      // Select element with source
      cy.get('.panel-body > table > tbody')
        .should('contain.text', connections[0].name)
        .and('contain.text', connections[0].url)
    })
  })
})
