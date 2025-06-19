Feature: Background music
  Scenario: Music transitions from menu to gameplay
    Given I open the game page
    Then menu music should be playing
    When I click the start screen
    Then the game should appear after a short delay
    Then gameplay music should be playing
