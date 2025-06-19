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

  Scenario: Star background visible in gameplay
    Given I open the game page
    When I click the start screen
    Then the game should appear after a short delay
    And the star background should cover the game area

  Scenario: Legend hidden before starting the game
    Given I open the game page
    Then the legend should not be visible

  Scenario: Legend displayed on start
    Given I open the game page
    When I click the start screen
    Then the game should appear after a short delay
    And the legend should be visible
