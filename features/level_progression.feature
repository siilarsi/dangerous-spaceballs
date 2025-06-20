Feature: Level progression
  Scenario: Difficulty increases over time
    Given I open the game page
    And the level progression interval is 100 ms
    When I click the start screen
    Then the game should appear after a short delay
    When I wait for 600 ms
    Then the level should be 6

  Scenario: Game starts with a single orb
    Given I open the game page
    And the level progression interval is 10000 ms
    When I click the start screen
    Then the game should appear after a short delay
    Then there should be 1 orbs

  Scenario: New orb appears when the level increases
    Given I open the game page
    And the level progression interval is 100 ms
    When I click the start screen
    Then the game should appear after a short delay
    When I wait for 250 ms
    Then there should be at least 3 orbs
