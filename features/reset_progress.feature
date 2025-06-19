Feature: Reset progress
  Scenario: Reset button clears saved data
    Given I open the game page
    And I have 10 credits
    And the high score is 20
    When I open the shop tab
    And I buy the upgrade "Increase Max Ammo"
    And I click the reset button
    When I reload the page
    And I click the start screen
    Then the game should appear after a short delay
    And my ammo should be 50
    And the displayed credits should be 0
    And the high score should be 0
    And no permanent upgrades should be stored
