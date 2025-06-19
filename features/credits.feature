Feature: Earning credits
  Scenario: Credits increase when shooting red orbs
    Given I open the game page
    When I click the start screen
    Then the game should appear after a short delay
    When I simulate hitting 3 red orbs
    Then the credits should be 3
