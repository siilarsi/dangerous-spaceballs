Feature: Start the game
  Scenario: Player starts the game from the intro screen
    Given I open the game page
    When I click the start button
    Then the promo animation should be shown
    And the game should appear after a short delay
