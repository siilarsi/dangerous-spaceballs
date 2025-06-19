Feature: Planet hazards
  Scenario: Ship crashes into a planet
    Given I open the game page
    When I click the start screen
    Then the game should appear after a short delay
    When I spawn a planet on the ship
    Then the game should be over
