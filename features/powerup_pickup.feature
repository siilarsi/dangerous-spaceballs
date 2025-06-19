Feature: Power-up pickups
  Scenario: Collecting an ammo power-up increases ammo
    Given I open the game page
    When I click the start screen
    Then the game should appear after a short delay
    When I spawn an ammo power-up on the ship
    Then the ammo should increase by 15

  Scenario: Power-ups linger before fading
    Given I open the game page
    When I click the start screen
    Then the game should appear after a short delay
    When I spawn an ammo power-up offset by 100 0 from the ship
    When I wait for 7000 ms
    Then a power-up should be visible
    When I wait for 3000 ms
    Then no power-ups should be visible
