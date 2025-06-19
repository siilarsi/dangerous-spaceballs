Feature: High score tracking
  Scenario: High score shown when starting the game
    Given I open the game page
    Then the high score should be 0

  Scenario: High score saved after a game
    Given I open the game page
    When I click the start screen
    Then the game should appear after a short delay
    When I simulate hitting 1 red orbs
    And I spawn a planet on the ship
    Then the game should be over
    When I reload the page
    Then the high score should be 10
