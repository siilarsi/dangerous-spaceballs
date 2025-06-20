Feature: Laser firing
  Scenario: Holding left mouse button fires bullets and drains ammo
    Given I open the game page
    When I click the start screen
    Then the game should appear after a short delay
    When I hold the left mouse button for 300 ms
    Then bullets should be fired
    And the ammo should decrease
    When I release the left mouse button

  Scenario: Cooldown indicator shown when firing
    Given I open the game page
    When I click the start screen
    Then the game should appear after a short delay
    When I hold the left mouse button for 100 ms
    Then the cooldown indicator should be visible
    When I release the left mouse button
