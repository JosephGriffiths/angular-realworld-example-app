/// <reference types="cypress"/>


describe('Test with backend', () => {
    beforeEach('Login to the app', () => {
        cy.intercept({method: 'Get', path:'tags'}, { fixture: "tags.json" });
        cy.loginToApplication()
    })

    it('verify correct request and response', () => {

        //create CY serve
        //New way:
        cy.intercept('POST', '**/articles').as('postArticles')

        cy.contains('New Article').click()
        cy.get('[formcontrolname="title"]').type('This is a title')
        cy.get('[formcontrolname="description"]').type('This is the description')
        cy.get('[formcontrolname="body"]').type('This is a body of the article')
        cy.contains('Publish Article').click()

        cy.wait('@postArticles').then(xhr => {
            console.log(xhr)
            expect(xhr.response.statusCode).to.eq(200)
            expect(xhr.request.body.article.body).to.equal('This is a body of the article')
            expect(xhr.response.body.article.description).to.equal('This is the description')
        })
    })

    it("should gave tags with routing object", () => {
        cy.get(".tag-list")
        .should("contain", "cypress")
        .and("contain", "automation")
        .and("contain", "testing");
    });

    it('should verify global feed likes count', () => {
        cy.intercept('GET', '**/articles/feed*', {"articles":[],"articlescount":0})
        cy.intercept('GET', '**/articles', { fixture: "articles.json" })

        cy.contains('Global Feed').click()

        cy.fixture('articles').then( file => {
            const articlesLink = file.articles[1].slug
            cy.intercept('POST', '**/articles/'+articlesLink+'/favourite', file)
        })

        cy.get('app-article-list button').eq(1).click().should('contain', '1')

      })

      it.only('intercepting and modifying request and response', () => {

        // cy.intercept('POST', '**/articles', (req) => {
        //     req.body.article.description = 'This is a description 2'
        // }).as('postArticles')

        cy.intercept('POST', '**/articles', (req) => {
            req.reply( res => {
                expect(res.body.article.description).to.equal('This is the description')
                res.body.article.description = 'This is a description 2'
            })
        }).as('postArticles')

        cy.contains('New Article').click()
        cy.get('[formcontrolname="title"]').type('This is a title')
        cy.get('[formcontrolname="description"]').type('This is the description')
        cy.get('[formcontrolname="body"]').type('This is a body of the article')
        cy.contains('Publish Article').click()

        cy.wait('@postArticles').then(xhr => {
            console.log(xhr)
            expect(xhr.response.statusCode).to.eq(200)
            expect(xhr.request.body.article.body).to.equal('This is a body of the article')
            expect(xhr.response.body.article.description).to.equal('This is a description 2')
        })
    })
    
})