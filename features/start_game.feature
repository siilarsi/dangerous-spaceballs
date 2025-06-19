Feature: Start the game
  Scenario: Player starts the game from the intro screen
    Given I open the game page
    When I click the start screen
    Then the promo animation should be shown
    And the game should appear after a short delay

  Scenario: Game starts at level 1 after waiting on the start screen
    Given I open the game page
    When I wait for 1200 ms
    And I click the start screen
    Then the promo animation should be shown
    And the game should appear after a short delay
    And the level should be 1
    And the time remaining should be 60
