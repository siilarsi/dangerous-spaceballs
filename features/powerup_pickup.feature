Feature: Power-up pickups
  Scenario: Collecting an ammo power-up increases ammo
    Given I open the game page
    When I click the start screen
    Then the game should appear after a short delay
    When I spawn an ammo power-up on the ship
    Then the ammo should increase by 15
