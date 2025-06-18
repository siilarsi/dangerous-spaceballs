Feature: Streak feedback
  Scenario: Score scaling and streak announcement
    Given I open the game page
    When I click the start button
    Then the game should appear after a short delay
    When I simulate hitting 5 red orbs
    Then the streak should be 5
    And the score should be 150
    And the streak text "Streak 5!" should appear
