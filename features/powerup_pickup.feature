Feature: Power-up pickups
  Scenario: Collecting an ammo power-up increases ammo
    Given I open the game page
    When I click the start screen
    Then the game should appear after a short delay
    When I spawn an ammo power-up on the ship
    Then the ammo should increase by 15
    And the floating text "+15 Ammo" should appear

  Scenario: Ammo power-ups give less ammo at high levels
    Given I open the game page
    When I click the start screen
    Then the game should appear after a short delay
    When I set the game level to 10
    When I spawn an ammo power-up on the ship
    Then the ammo should increase by 8
    And the floating text "+8 Ammo" should appear

  Scenario: Power-ups linger before fading
    Given I open the game page
    When I click the start screen
    Then the game should appear after a short delay
    When I spawn an ammo power-up offset by 150 0 from the ship
    When I wait for 8000 ms
    Then a power-up should be visible
    When I wait for 10000 ms
    Then no power-ups should be visible
