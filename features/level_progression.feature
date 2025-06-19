Feature: Level progression
  Scenario: Difficulty increases over time
    Given I open the game page
    And the level progression interval is 1000 ms
    When I click the start screen
    Then the game should appear after a short delay
    When I wait for 600 ms
    Then the level should be 6
