Feature: Laser firing
  Scenario: Holding left mouse button fires bullets and drains ammo
    Given I open the game page
    When I click the start button
    Then the game should appear after a short delay
    When I hold the left mouse button for 300 ms
    Then bullets should be fired
    And the ammo should decrease
    When I release the left mouse button
