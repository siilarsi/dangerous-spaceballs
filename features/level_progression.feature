Feature: Level progression
  Scenario: Difficulty increases over time
    Given I open the game page
    When I click the start button
    Then the game should appear after a short delay
    When I wait for 15500 ms
    Then the level should be 2
